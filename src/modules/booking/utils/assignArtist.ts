import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Artist } from "../hooks/useArtists";
import type { AppointmentDocument } from "@/features/appointments/types";

export const assignArtist = async (startTime: Date, endTime: Date, artists: Artist[]): Promise<Artist | null> => {
	// Fetch appointments that overlap with the desired slot
	// We need to check if any appointment overlaps
	// Overlap condition: (StartA < EndB) and (EndA > StartB)

	// Since we can't easily do complex overlap queries in Firestore for *all* appointments without fetching a lot,
	// we'll fetch appointments around the time range.
	// A safe bet is to fetch appointments starting on the same day.
	// But for efficiency, let's just fetch appointments that start before the end time and end after the start time.
	// Firestore doesn't support multiple inequality filters on different fields easily.

	// Strategy: Fetch all appointments for the day (like useAvailability does) or just fetch all active appointments and filter in memory if the dataset is small.
	// Better: Query appointments where startTime is within the same day.

	const startOfDay = new Date(startTime);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(startTime);
	endOfDay.setHours(23, 59, 59, 999);

	const q = query(
		collection(db, "appointments"),
		where("startTime", ">=", Timestamp.fromDate(startOfDay)),
		where("startTime", "<=", Timestamp.fromDate(endOfDay)),
	);

	const snapshot = await getDocs(q);
	const appointments = snapshot.docs.map((doc) => {
		const data = doc.data() as AppointmentDocument;
		return {
			...data,
			start: data.startTime.toDate(),
			end: data.endTime.toDate(),
		};
	});

	// Find an artist who does NOT have an overlapping appointment
	for (const artist of artists) {
		const hasOverlap = appointments.some((appt) => {
			if (appt.artistId !== artist.id) return false;
			if (appt.status === "cancelled") return false;
			return appt.start < endTime && appt.end > startTime;
		});

		if (!hasOverlap) {
			return artist;
		}
	}

	return null;
};
