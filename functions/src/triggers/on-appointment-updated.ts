import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "../services/email-service.js";
import {
	appointmentApprovedHtml,
	appointmentDeclinedHtml,
	appointmentCancelledHtml,
	appointmentRescheduledHtml,
} from "../emails/templates.js";
import { AppointmentData, AppointmentEmailData, AppointmentStatus } from "../types/index.js";
import { isValidEmail, toEmailData, formatDate, formatTime } from "../utils/appointment-helpers.js";

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

		const emailData = toEmailData(appointmentId, after, after.cancellationToken);

		// Check for status change
		const statusChanged = before.status !== after.status;
		if (statusChanged) {
			await sendStatusChangeEmail(appointmentId, before.status, after.status, emailData, after.clientEmail);
		}

		// Check for reschedule (time change) - only for upcoming appointments
		// Skip if status also changed to avoid sending two emails in the same update
		if (!statusChanged && after.status === "upcoming" && hasTimeChanged(before, after)) {
			await sendRescheduleEmail(appointmentId, before, after, emailData);
		}
	},
);
