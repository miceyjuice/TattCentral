/**
 * Create Stripe Checkout Session
 *
 * Callable function that creates a Stripe Checkout session for appointment deposits.
 * If the service is a consultation (free), it creates the appointment directly.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStripeClient, getDepositAmountGrosze, requiresPayment } from "./stripe-client.js";
import type { CreateCheckoutRequest, AppointmentDocument } from "./types.js";

const db = getFirestore();

/**
 * Validate the appointment data from the client
 */
function validateAppointmentData(data: CreateCheckoutRequest): void {
	if (!data.appointmentData) {
		throw new HttpsError("invalid-argument", "Missing appointment data");
	}

	const { artistId, artistName, clientName, clientEmail, type, startTime, endTime } = data.appointmentData;

	if (!artistId || !artistName) {
		throw new HttpsError("invalid-argument", "Missing artist information");
	}

	if (!clientName || !clientEmail) {
		throw new HttpsError("invalid-argument", "Missing client information");
	}

	if (!type) {
		throw new HttpsError("invalid-argument", "Missing appointment type");
	}

	if (!startTime || !endTime) {
		throw new HttpsError("invalid-argument", "Missing appointment time");
	}

	// Validate dates
	const start = new Date(startTime);
	const end = new Date(endTime);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		throw new HttpsError("invalid-argument", "Invalid appointment time format");
	}

	if (start >= end) {
		throw new HttpsError("invalid-argument", "End time must be after start time");
	}

	if (start < new Date()) {
		throw new HttpsError("invalid-argument", "Cannot book appointments in the past");
	}

	if (!data.serviceId) {
		throw new HttpsError("invalid-argument", "Missing service ID");
	}

	if (!data.successUrl || !data.cancelUrl) {
		throw new HttpsError("invalid-argument", "Missing redirect URLs");
	}
}

/**
 * Create an appointment document in Firestore
 */
async function createAppointment(
	data: CreateCheckoutRequest,
	paymentData?: {
		stripeSessionId: string;
		depositAmount: number;
	},
): Promise<string> {
	const docRef = db.collection("appointments").doc();
	const cancellationToken = crypto.randomUUID();

	const appointment: AppointmentDocument = {
		artistId: data.appointmentData.artistId,
		clientId: "guest", // Guest booking
		artistName: data.appointmentData.artistName,
		clientName: data.appointmentData.clientName,
		clientEmail: data.appointmentData.clientEmail,
		clientPhone: data.appointmentData.clientPhone,
		description: data.appointmentData.description,
		type: data.appointmentData.type,
		startTime: Timestamp.fromDate(new Date(data.appointmentData.startTime)),
		endTime: Timestamp.fromDate(new Date(data.appointmentData.endTime)),
		status: "pending", // Always pending until admin approves
		imageUrl: "", // Required by type but not used for display
		referenceImageUrls: data.appointmentData.referenceImageUrls,
		referenceImagePaths: data.appointmentData.referenceImagePaths,
		cancellationToken,
		// Payment fields
		...(paymentData && {
			stripeSessionId: paymentData.stripeSessionId,
			depositAmount: paymentData.depositAmount,
			paymentStatus: "pending" as const,
		}),
	};

	await docRef.set(appointment);
	return docRef.id;
}

/**
 * Create Stripe Checkout Session callable function
 */
export const createCheckoutSession = onCall(
	{
		region: "europe-west1",
		maxInstances: 10,
	},
	async (request) => {
		const data = request.data as CreateCheckoutRequest;

		// Validate input
		validateAppointmentData(data);

		const depositAmount = getDepositAmountGrosze(data.serviceId);

		// If no payment required (consultation), create appointment directly
		if (!requiresPayment(data.serviceId)) {
			const appointmentId = await createAppointment(data);
			return {
				noPaymentRequired: true,
				appointmentId,
			};
		}

		// Create Stripe Checkout session
		const stripe = getStripeClient();

		// Calculate expiration time (30 minutes from now)
		const expiresAt = Math.floor(Date.now() / 1000) + 1800;

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			customer_email: data.appointmentData.clientEmail,
			line_items: [
				{
					price_data: {
						currency: "pln",
						product_data: {
							name: `Deposit - ${data.appointmentData.type}`,
							description: `Appointment with ${data.appointmentData.artistName}`,
						},
						unit_amount: depositAmount,
					},
					quantity: 1,
				},
			],
			payment_method_types: ["card", "blik", "p24"],
			metadata: {
				appointmentData: JSON.stringify(data.appointmentData),
				serviceId: data.serviceId,
			},
			success_url: data.successUrl,
			cancel_url: data.cancelUrl,
			expires_at: expiresAt,
		});

		if (!session.url) {
			throw new HttpsError("internal", "Failed to create checkout session");
		}

		return {
			sessionId: session.id,
			sessionUrl: session.url,
		};
	},
);
