import type { Timestamp } from "firebase/firestore";

export type AppointmentDocument = {
	id?: string;
	artistId: string;
	clientId: string;
	artistName: string;
	clientName: string;
	startTime: Timestamp;
	endTime: Timestamp;
	status: "upcoming" | "completed" | "cancelled";
	imageUrl: string;
	rating?: number;
};

export type UpcomingAppointment = {
	id: string;
	title: string;
	dateRange: string;
	image: string;
};

export type PastAppointment = {
	id: string;
	date: string;
	title: string;
	rating: string;
	action: string;
};

export type AppointmentsResponse = {
	upcoming: UpcomingAppointment[];
	past: PastAppointment[];
};
