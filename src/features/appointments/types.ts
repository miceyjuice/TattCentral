export type UpcomingAppointment = {
	id: string;
	studio: string;
	dateRange: string;
	image: string;
};

export type PastAppointment = {
	id: string;
	date: string;
	artist: string;
	rating: string;
	action: string;
};

export type AppointmentsResponse = {
	upcoming: UpcomingAppointment[];
	past: PastAppointment[];
};
