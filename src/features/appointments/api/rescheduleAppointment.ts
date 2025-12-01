import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface RescheduleParams {
	appointmentId: string;
	newStartTime: Date;
	newEndTime: Date;
}

/**
 * Reschedules an appointment to a new date/time.
 * Updates the startTime and endTime in Firestore.
 */
export const rescheduleAppointment = async ({
	appointmentId,
	newStartTime,
	newEndTime,
}: RescheduleParams): Promise<void> => {
	const appointmentRef = doc(db, "appointments", appointmentId);

	await updateDoc(appointmentRef, {
		startTime: Timestamp.fromDate(newStartTime),
		endTime: Timestamp.fromDate(newEndTime),
	});
};
