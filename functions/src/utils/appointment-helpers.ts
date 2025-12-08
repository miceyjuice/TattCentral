import { AppointmentData, AppointmentEmailData } from "../types/index.js";

/**
 * Validates email address format using RFC 5322 compliant regex
 */
export function isValidEmail(email: string): boolean {
	const emailRegex =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
	return emailRegex.test(email);
}

/**
 * Formats a Firestore Timestamp to a readable date string
 */
export function formatDate(timestamp: FirebaseFirestore.Timestamp): string {
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
export function formatTime(timestamp: FirebaseFirestore.Timestamp): string {
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
export function calculateDuration(
	startTime: FirebaseFirestore.Timestamp,
	endTime: FirebaseFirestore.Timestamp,
): string {
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
 * App URL for generating links (defaults to production URL)
 */
const APP_URL = process.env.APP_URL || "https://tattcentral.web.app";

/**
 * Transforms Firestore appointment data to email template data
 * @param id - Appointment document ID
 * @param data - Appointment data from Firestore
 * @param cancellationToken - Optional token for cancellation link
 */
export function toEmailData(id: string, data: AppointmentData, cancellationToken?: string): AppointmentEmailData {
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
		cancellationUrl: cancellationToken ? `${APP_URL}/cancel/${id}?token=${cancellationToken}` : undefined,
	};
}
