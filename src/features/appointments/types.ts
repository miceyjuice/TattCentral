import type { Timestamp } from "firebase/firestore";

export type AppointmentDocument = {
	id?: string;
	artistId: string;
	clientId: string;
	artistName: string;
	clientName: string;
	type: string;
	startTime: Timestamp;
	endTime: Timestamp;
	status: "upcoming" | "completed" | "cancelled" | "pending";
	imageUrl: string;
	referenceImageUrls?: string[];
	referenceImagePaths?: string[]; // Storage paths for deletion
	rating?: number;
};

export type UpcomingAppointment = {
	id: string;
	title: string;
	type: string;
	dateRange: string;
	image: string;
	status: "upcoming" | "pending";
};

export type PastAppointment = {
	id: string;
	date: string;
	title: string;
	type: string;
	rating: string;
	action: string;
};

export type AppointmentsResponse = {
	upcoming: UpcomingAppointment[];
	past: PastAppointment[];
};
