/**
 * Stripe Webhook Handler
 *
 * HTTP function that handles Stripe webhook events for payment confirmation.
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStripeClient } from "./stripe-client.js";
import type { AppointmentDataInput, AppointmentDocument } from "./types.js";
import Stripe from "stripe";

const webhookSecret = defineString("STRIPE_WEBHOOK_SECRET");

/**
 * Create appointment from checkout session metadata
 * Fetches pending appointment data from Firestore using the ID stored in metadata
 */
async function createAppointmentFromSession(session: Stripe.Checkout.Session): Promise<string> {
	const metadata = session.metadata;

	if (!metadata?.pendingAppointmentId) {
		throw new Error("Missing pending appointment ID in session metadata");
	}

	const db = getFirestore();

	// Fetch the pending appointment data
	const pendingRef = db.collection("pendingAppointments").doc(metadata.pendingAppointmentId);
	const pendingDoc = await pendingRef.get();

	if (!pendingDoc.exists) {
		throw new Error(`Pending appointment not found: ${metadata.pendingAppointmentId}`);
	}

	const pendingData = pendingDoc.data() as AppointmentDataInput & {
		serviceId: string;
		depositAmount: number;
	};

	const docRef = db.collection("appointments").doc();
	const cancellationToken = crypto.randomUUID();

	const appointment: AppointmentDocument = {
		artistId: pendingData.artistId,
		clientId: "guest",
		artistName: pendingData.artistName,
		clientName: pendingData.clientName,
		clientEmail: pendingData.clientEmail,
		clientPhone: pendingData.clientPhone,
		description: pendingData.description,
		type: pendingData.type,
		startTime: Timestamp.fromDate(new Date(pendingData.startTime)),
		endTime: Timestamp.fromDate(new Date(pendingData.endTime)),
		status: "pending",
		imageUrl: "",
		referenceImageUrls: pendingData.referenceImageUrls,
		referenceImagePaths: pendingData.referenceImagePaths,
		cancellationToken,
		// Payment fields
		paymentStatus: "paid",
		paymentIntentId: session.payment_intent as string,
		depositAmount: pendingData.depositAmount,
		stripeSessionId: session.id,
		paidAt: Timestamp.now(),
	};

	await docRef.set(appointment);

	// Delete the pending appointment after successful creation
	await pendingRef.delete();

	return docRef.id;
}

/**
 * Handle charge refunded event
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
	const paymentIntentId = charge.payment_intent as string;

	if (!paymentIntentId) {
		console.warn("No payment intent ID in refund event");
		return;
	}

	// Find appointment by payment intent ID
	const db = getFirestore();
	const snapshot = await db.collection("appointments").where("paymentIntentId", "==", paymentIntentId).limit(1).get();

	if (snapshot.empty) {
		console.warn(`No appointment found for payment intent: ${paymentIntentId}`);
		return;
	}

	const appointmentDoc = snapshot.docs[0];
	await appointmentDoc.ref.update({
		paymentStatus: "refunded",
		refundedAt: Timestamp.now(),
	});

	console.log(`Marked appointment ${appointmentDoc.id} as refunded`);
}

/**
 * Stripe webhook HTTP handler
 */
export const stripeWebhook = onRequest(
	{
		region: "europe-west1",
		maxInstances: 10,
	},
	async (req, res) => {
		if (req.method !== "POST") {
			res.status(405).send("Method not allowed");
			return;
		}

		const stripe = getStripeClient();
		const signature = req.headers["stripe-signature"];

		if (!signature) {
			res.status(400).send("Missing signature");
			return;
		}

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret.value());
		} catch (err) {
			console.error("Webhook signature verification failed:", err);
			res.status(400).send("Invalid signature");
			return;
		}

		try {
			switch (event.type) {
				case "checkout.session.completed": {
					const session = event.data.object as Stripe.Checkout.Session;

					if (session.payment_status === "paid") {
						const appointmentId = await createAppointmentFromSession(session);
						console.log(`Created appointment ${appointmentId} from checkout session ${session.id}`);
					}
					break;
				}

				case "checkout.session.expired": {
					const session = event.data.object as Stripe.Checkout.Session;
					console.log(`Checkout session expired: ${session.id}`);

					// Clean up the pending appointment
					const pendingId = session.metadata?.pendingAppointmentId;
					if (pendingId) {
						const db = getFirestore();
						await db.collection("pendingAppointments").doc(pendingId).delete();
						console.log(`Deleted pending appointment ${pendingId} after session expiry`);
					}
					break;
				}

				case "charge.refunded": {
					const charge = event.data.object as Stripe.Charge;
					await handleChargeRefunded(charge);
					break;
				}

				default:
					console.log(`Unhandled event type: ${event.type}`);
			}

			res.status(200).json({ received: true });
		} catch (err) {
			console.error("Error processing webhook:", err);
			res.status(500).send("Webhook handler failed");
		}
	},
);
