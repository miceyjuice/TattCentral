import { AppointmentData, AppointmentEmailData } from "../types";

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
 * Transforms Firestore appointment data to email template data
 */
export function toEmailData(id: string, data: AppointmentData): AppointmentEmailData {
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
