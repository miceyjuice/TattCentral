import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppointmentsResponse, AppointmentDocument, UpcomingAppointment, PastAppointment } from "../types";
import type { UserRole } from "@/features/users";

export const getAppointments = async (userId?: string, role?: UserRole): Promise<AppointmentsResponse> => {
	let q;

	if (role === "artist" && userId) {
		q = query(collection(db, "appointments"), where("artistId", "==", userId));
	} else {
		// Admin sees all (or default behavior)
		q = collection(db, "appointments");
	}

	const querySnapshot = await getDocs(q);

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

		if (data.status === "upcoming" || data.status === "pending") {
			const start = data.startTime.toDate();
			const end = data.endTime.toDate();
			const dateRange = `${formatDate(start)} - ${new Intl.DateTimeFormat("en-US", {
				hour: "numeric",
				minute: "numeric",
			}).format(end)}`;

			upcoming.push({
				id,
				title: data.clientName || "Unknown Client",
				dateRange,
				image: data.imageUrl,
				status: data.status,
			});
		} else if (data.status === "completed") {
			past.push({
				id,
				title: data.clientName || "Unknown Client",
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
