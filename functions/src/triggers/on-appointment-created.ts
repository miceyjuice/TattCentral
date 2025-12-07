import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { sendEmail } from "../services/email-service.js";
import { bookingConfirmationHtml } from "../emails/templates.js";
import { AppointmentData } from "../types/index.js";
import { isValidEmail, toEmailData } from "../utils/appointment-helpers.js";

/**
 * Triggered when a new appointment document is created
 * Generates a cancellation token and sends a booking confirmation email
 */
export const onAppointmentCreated = onDocumentCreated(
	{
		document: "appointments/{appointmentId}",
		region: "europe-west1",
	},
	async (event) => {
		const snapshot = event.data;
		if (!snapshot) {
			logger.warn("No data associated with the event");
			return;
		}

		const appointmentId = event.params.appointmentId;
		const data = snapshot.data() as AppointmentData;

		logger.info("New appointment created", {
			appointmentId,
			clientEmail: data.clientEmail,
			status: data.status,
		});

		// Generate cancellation token if not already present
		let cancellationToken = data.cancellationToken;
		if (!cancellationToken) {
			cancellationToken = randomUUID();
			try {
				await getFirestore().collection("appointments").doc(appointmentId).update({
					cancellationToken,
				});
				logger.info("Generated cancellation token", { appointmentId });
			} catch (error) {
				logger.error("Failed to store cancellation token", { appointmentId, error });
				// Continue with email - token generation failure shouldn't block the email
			}
		}

		// Only send confirmation email for pending appointments
		if (data.status !== "pending") {
			logger.info("Skipping email - appointment is not pending", { status: data.status });
			return;
		}

		// Validate email
		if (!data.clientEmail || !isValidEmail(data.clientEmail)) {
			logger.error("Invalid client email", { clientEmail: data.clientEmail });
			return;
		}

		// Prepare email data with cancellation token
		const emailData = toEmailData(appointmentId, data, cancellationToken);

		// Send booking confirmation email
		const result = await sendEmail({
			to: data.clientEmail,
			subject: "Your booking request at TattCentral",
			html: bookingConfirmationHtml(emailData),
		});

		if (result.success) {
			logger.info("Booking confirmation email sent", {
				appointmentId,
				messageId: result.messageId,
			});
		} else {
			logger.error("Failed to send booking confirmation email", {
				appointmentId,
				error: result.error,
			});
		}
	},
);
