import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppointmentDocument } from "../types";

export type CreateAppointmentData = Omit<AppointmentDocument, "id" | "startTime" | "endTime"> & {
	startTime: Date;
	endTime: Date;
};

/**
 * Generates a new appointment ID without creating the document.
 * Use this to get an ID for organizing uploads before saving.
 */
export const generateAppointmentId = (): string => {
	const docRef = doc(collection(db, "appointments"));
	return docRef.id;
};

/**
 * Creates an appointment with a specific ID.
 * Use generateAppointmentId() first if you need the ID before creation.
 */
export const createAppointment = async (data: CreateAppointmentData, appointmentId?: string) => {
	const appointmentsCollection = collection(db, "appointments");
	const docRef = appointmentId ? doc(appointmentsCollection, appointmentId) : doc(appointmentsCollection);

	await setDoc(docRef, {
		...data,
		startTime: Timestamp.fromDate(data.startTime),
		endTime: Timestamp.fromDate(data.endTime),
	});

	return docRef.id;
};
