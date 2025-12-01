import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppointmentDocument, AppointmentDetail } from "../types";

/**
 * Fetches a single appointment by ID with all details.
 * Used for the appointment detail sheet/view.
 */
export const getAppointmentById = async (appointmentId: string): Promise<AppointmentDetail | null> => {
	const appointmentRef = doc(db, "appointments", appointmentId);
	const appointmentSnap = await getDoc(appointmentRef);

	if (!appointmentSnap.exists()) {
		return null;
	}

	const data = appointmentSnap.data() as AppointmentDocument;

	return {
		id: appointmentSnap.id,
		clientName: data.clientName,
		clientEmail: data.clientEmail,
		clientPhone: data.clientPhone,
		description: data.description,
		type: data.type,
		status: data.status,
		artistName: data.artistName,
		startTime: data.startTime.toDate(),
		endTime: data.endTime.toDate(),
		referenceImageUrls: data.referenceImageUrls,
	};
};
