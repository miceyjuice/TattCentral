import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppointmentsResponse, AppointmentDocument, UpcomingAppointment, PastAppointment } from "../types";

export const getAppointments = async (): Promise<AppointmentsResponse> => {
	const querySnapshot = await getDocs(collection(db, "appointments"));

	const upcoming: UpcomingAppointment[] = [];
	const past: PastAppointment[] = [];

	querySnapshot.forEach((doc) => {
		const data = doc.data() as AppointmentDocument;
		const id = doc.id;

		// Helper to format dates like "July 15, 2024, 2:00 PM"
		const formatDate = (date: Date) =>
			new Intl.DateTimeFormat("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
			}).format(date);

		if (data.status === "upcoming") {
			const start = data.startTime.toDate();
			const end = data.endTime.toDate();
			const dateRange = `${formatDate(start)} - ${new Intl.DateTimeFormat("en-US", {
				hour: "numeric",
				minute: "numeric",
			}).format(end)}`;

			upcoming.push({
				id,
				studio: data.artistName,
				dateRange,
				image: data.imageUrl,
			});
		} else if (data.status === "completed") {
			past.push({
				id,
				artist: data.artistName,
				date:
					formatDate(data.startTime.toDate()).split(",")[0] +
					"," +
					formatDate(data.startTime.toDate()).split(",")[1], // Just date part
				rating: data.rating ? `${data.rating} stars` : "No rating",
				action: "Book Again", // Default action
			});
		}
	});

	return { upcoming, past };
};
