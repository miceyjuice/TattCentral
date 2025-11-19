import type { AppointmentsResponse } from "./types";

export const mockAppointments: AppointmentsResponse = {
	upcoming: [
		{
			id: "1",
			studio: "Sarah's Studio",
			dateRange: "July 15, 2024, 2:00 PM - 3:00 PM",
			image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=900&q=80",
		},
	],
	past: [
		{
			id: "1",
			date: "June 10, 2024",
			artist: "Sarah's Studio",
			rating: "4 stars",
			action: "Review",
		},
		{
			id: "2",
			date: "May 5, 2024",
			artist: "Sarah's Studio",
			rating: "5 stars",
			action: "Book Again",
		},
	],
};
