import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppointmentDocument } from "../types";

/**
 * Error types for cancellation failures
 */
export type CancelAppointmentError =
	| "NOT_FOUND"
	| "INVALID_TOKEN"
	| "ALREADY_CANCELLED"
	| "ALREADY_COMPLETED"
	| "TOO_LATE"
	| "UNKNOWN";

/**
 * Result of cancellation attempt
 */
export type CancelAppointmentResult = { success: true } | { success: false; error: CancelAppointmentError };

/**
 * Appointment data returned for the cancel page
 */
export interface CancelPageAppointment {
	id: string;
	clientName: string;
	artistName: string;
	type: string;
	status: AppointmentDocument["status"];
	startTime: Date;
	endTime: Date;
}

/**
 * Fetches appointment data for the cancel page.
 * Validates the token before returning data.
 */
export async function getAppointmentForCancel(
	appointmentId: string,
	token: string,
): Promise<{ appointment: CancelPageAppointment } | { error: CancelAppointmentError }> {
	const appointmentRef = doc(db, "appointments", appointmentId);
	const appointmentSnap = await getDoc(appointmentRef);

	if (!appointmentSnap.exists()) {
		return { error: "NOT_FOUND" };
	}

	const data = appointmentSnap.data() as AppointmentDocument;

	// Validate token
	if (!data.cancellationToken || data.cancellationToken !== token) {
		return { error: "INVALID_TOKEN" };
	}

	return {
		appointment: {
			id: appointmentSnap.id,
			clientName: data.clientName,
			artistName: data.artistName,
			type: data.type,
			status: data.status,
			startTime: data.startTime.toDate(),
			endTime: data.endTime.toDate(),
		},
	};
}

/**
 * Minimum hours before appointment that cancellation is allowed
 */
const MIN_HOURS_BEFORE_CANCEL = 24;

/**
 * Cancels an appointment using the cancellation token.
 * Validates token, checks time restrictions, and updates status.
 */
export async function cancelAppointmentByToken(appointmentId: string, token: string): Promise<CancelAppointmentResult> {
	const appointmentRef = doc(db, "appointments", appointmentId);
	const appointmentSnap = await getDoc(appointmentRef);

	if (!appointmentSnap.exists()) {
		return { success: false, error: "NOT_FOUND" };
	}

	const data = appointmentSnap.data() as AppointmentDocument;

	// Validate token
	if (!data.cancellationToken || data.cancellationToken !== token) {
		return { success: false, error: "INVALID_TOKEN" };
	}

	// Check if already cancelled
	if (data.status === "cancelled") {
		return { success: false, error: "ALREADY_CANCELLED" };
	}

	// Check if already completed
	if (data.status === "completed") {
		return { success: false, error: "ALREADY_COMPLETED" };
	}

	// Check if appointment has already passed
	const now = new Date();
	const appointmentTime = data.startTime.toDate();

	if (appointmentTime <= now) {
		return { success: false, error: "ALREADY_COMPLETED" };
	}

	// Check 24-hour restriction
	const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	if (hoursUntilAppointment < MIN_HOURS_BEFORE_CANCEL) {
		return { success: false, error: "TOO_LATE" };
	}

	// Cancel the appointment
	try {
		await updateDoc(appointmentRef, {
			status: "cancelled",
			updatedAt: serverTimestamp(),
		});
		return { success: true };
	} catch {
		return { success: false, error: "UNKNOWN" };
	}
}
