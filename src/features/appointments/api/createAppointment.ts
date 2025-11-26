import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppointmentDocument } from "../types";

export type CreateAppointmentData = Omit<AppointmentDocument, "id" | "startTime" | "endTime"> & {
	startTime: Date;
	endTime: Date;
};

export const createAppointment = async (data: CreateAppointmentData) => {
	const docRef = await addDoc(collection(db, "appointments"), {
		...data,
		startTime: Timestamp.fromDate(data.startTime),
		endTime: Timestamp.fromDate(data.endTime),
	});
	return docRef.id;
};
