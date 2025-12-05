import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "../services/email-service";
import { bookingConfirmationHtml } from "../emails/templates";
import { AppointmentData, AppointmentEmailData } from "../types";

/**
 * Formats a Firestore Timestamp to a readable date string
 */
function formatDate(timestamp: FirebaseFirestore.Timestamp): string {
	const date = timestamp.toDate();
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Formats a Firestore Timestamp to a time string
 */
function formatTime(timestamp: FirebaseFirestore.Timestamp): string {
	const date = timestamp.toDate();
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

/**
 * Calculates duration between two timestamps
 */
function calculateDuration(startTime: FirebaseFirestore.Timestamp, endTime: FirebaseFirestore.Timestamp): string {
	const start = startTime.toDate();
	const end = endTime.toDate();
	const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

	if (diffMinutes >= 60) {
		const hours = Math.floor(diffMinutes / 60);
		const mins = diffMinutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? "s" : ""}`;
	}
	return `${diffMinutes} minutes`;
}

/**
 * Transforms Firestore appointment data to email template data
 */
function toEmailData(id: string, data: AppointmentData): AppointmentEmailData {
	return {
		appointmentId: id,
		clientName: data.clientName,
		clientEmail: data.clientEmail,
		artistName: data.artistName,
		serviceType: data.type,
		date: formatDate(data.startTime),
		time: formatTime(data.startTime),
		duration: calculateDuration(data.startTime, data.endTime),
	};
}

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
		if (!data.clientEmail || !data.clientEmail.includes("@")) {
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
