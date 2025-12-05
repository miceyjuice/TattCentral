import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "../services/email-service";
import {
	appointmentApprovedHtml,
	appointmentDeclinedHtml,
	appointmentCancelledHtml,
	appointmentRescheduledHtml,
} from "../emails/templates";
import { AppointmentData, AppointmentEmailData, AppointmentStatus } from "../types";

/**
 * Validates email address format using RFC 5322 compliant regex
 */
function isValidEmail(email: string): boolean {
	const emailRegex =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
	return emailRegex.test(email);
}

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
		startTime: data.startTime.toDate(),
		endTime: data.endTime.toDate(),
	};
}

/**
 * Checks if the appointment times have changed (rescheduled)
 */
function hasTimeChanged(before: AppointmentData, after: AppointmentData): boolean {
	const beforeStart = before.startTime.toMillis();
	const afterStart = after.startTime.toMillis();
	const beforeEnd = before.endTime.toMillis();
	const afterEnd = after.endTime.toMillis();

	return beforeStart !== afterStart || beforeEnd !== afterEnd;
}

/**
 * Sends the appropriate email based on status change
 */
async function sendStatusChangeEmail(
	appointmentId: string,
	oldStatus: AppointmentStatus,
	newStatus: AppointmentStatus,
	emailData: AppointmentEmailData,
	clientEmail: string,
): Promise<void> {
	let subject: string;
	let html: string;

	switch (newStatus) {
		case "upcoming":
			// Only send if transitioning from pending
			if (oldStatus !== "pending") {
				logger.info("Skipping approved email - not from pending", { oldStatus });
				return;
			}
			subject = "Your appointment is confirmed! - TattCentral";
			html = appointmentApprovedHtml(emailData);
			break;

		case "declined":
			subject = "Update about your booking request - TattCentral";
			html = appointmentDeclinedHtml(emailData);
			break;

		case "cancelled":
			subject = "Your appointment has been cancelled - TattCentral";
			html = appointmentCancelledHtml(emailData);
			break;

		default:
			logger.info("No email needed for status change", { oldStatus, newStatus });
			return;
	}

	const result = await sendEmail({
		to: clientEmail,
		subject,
		html,
	});

	if (result.success) {
		logger.info("Status change email sent", {
			appointmentId,
			newStatus,
			messageId: result.messageId,
		});
	} else {
		logger.error("Failed to send status change email", {
			appointmentId,
			newStatus,
			error: result.error,
		});
	}
}

/**
 * Sends reschedule email
 */
async function sendRescheduleEmail(
	appointmentId: string,
	before: AppointmentData,
	after: AppointmentData,
	emailData: AppointmentEmailData,
): Promise<void> {
	const oldData = {
		date: formatDate(before.startTime),
		time: formatTime(before.startTime),
	};

	const result = await sendEmail({
		to: after.clientEmail,
		subject: "Your appointment has been rescheduled - TattCentral",
		html: appointmentRescheduledHtml(emailData, oldData),
	});

	if (result.success) {
		logger.info("Reschedule email sent", {
			appointmentId,
			messageId: result.messageId,
		});
	} else {
		logger.error("Failed to send reschedule email", {
			appointmentId,
			error: result.error,
		});
	}
}

/**
 * Triggered when an appointment document is updated
 * Sends emails for status changes and reschedules
 */
export const onAppointmentUpdated = onDocumentUpdated(
	{
		document: "appointments/{appointmentId}",
		region: "europe-west1",
	},
	async (event) => {
		const beforeSnapshot = event.data?.before;
		const afterSnapshot = event.data?.after;

		if (!beforeSnapshot || !afterSnapshot) {
			logger.warn("No data associated with the event");
			return;
		}

		const appointmentId = event.params.appointmentId;
		const before = beforeSnapshot.data() as AppointmentData;
		const after = afterSnapshot.data() as AppointmentData;

		logger.info("Appointment updated", {
			appointmentId,
			oldStatus: before.status,
			newStatus: after.status,
		});

		// Validate email
		if (!after.clientEmail || !isValidEmail(after.clientEmail)) {
			logger.error("Invalid client email", { clientEmail: after.clientEmail });
			return;
		}

		const emailData = toEmailData(appointmentId, after);

		// Check for status change
		if (before.status !== after.status) {
			await sendStatusChangeEmail(appointmentId, before.status, after.status, emailData, after.clientEmail);
		}

		// Check for reschedule (time change) - only for upcoming appointments
		if (after.status === "upcoming" && hasTimeChanged(before, after)) {
			await sendRescheduleEmail(appointmentId, before, after, emailData);
		}
	},
);
