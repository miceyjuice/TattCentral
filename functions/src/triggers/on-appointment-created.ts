import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "../services/email-service";
import { bookingConfirmationHtml } from "../emails/templates";
import { AppointmentData } from "../types";
import { isValidEmail, toEmailData } from "../utils/appointment-helpers";

/**
 * Triggered when a new appointment document is created
 * Sends a booking confirmation email to the client
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

		// Prepare email data
		const emailData = toEmailData(appointmentId, data);

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
