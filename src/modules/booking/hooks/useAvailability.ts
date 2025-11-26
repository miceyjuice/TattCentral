import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfDay, endOfDay, addMinutes, setHours, setMinutes, isBefore, isAfter } from "date-fns";
import { useArtists } from "./useArtists";
import type { AppointmentDocument } from "@/features/appointments/types";

const SHOP_OPEN_HOUR = 10;
const SHOP_CLOSE_HOUR = 20;
const SLOT_INTERVAL = 30; // minutes

export const useAvailability = (date: Date | undefined, durationMinutes: number, artistId: string | null) => {
	const [availableTimes, setAvailableTimes] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { data: artists = [] } = useArtists();

	useEffect(() => {
		const fetchAvailability = async () => {
			if (!date) {
				setAvailableTimes([]);
				return;
			}

			setIsLoading(true);
			try {
				// 1. Fetch appointments for the day
				const start = startOfDay(date);
				const end = endOfDay(date);

				const q = query(
					collection(db, "appointments"),
					where("startTime", ">=", Timestamp.fromDate(start)),
					where("startTime", "<=", Timestamp.fromDate(end)),
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

				// 2. Generate all possible slots
				const slots: string[] = [];
				let currentSlot = setMinutes(setHours(date, SHOP_OPEN_HOUR), 0);
				const closingTime = setMinutes(setHours(date, SHOP_CLOSE_HOUR), 0);

				while (
					isBefore(addMinutes(currentSlot, durationMinutes), closingTime) ||
					addMinutes(currentSlot, durationMinutes).getTime() === closingTime.getTime()
				) {
					const slotStart = currentSlot;
					const slotEnd = addMinutes(currentSlot, durationMinutes);

					let isSlotAvailable = false;

					if (artistId) {
						// Check specific artist
						const hasOverlap = appointments.some((appt) => {
							if (appt.artistId !== artistId) return false;
							if (appt.status === "cancelled") return false;
							// Check overlap: (StartA < EndB) and (EndA > StartB)
							return isBefore(appt.start, slotEnd) && isAfter(appt.end, slotStart);
						});
						isSlotAvailable = !hasOverlap;
					} else {
						// Check if ANY artist is free
						// We need at least one artist who does NOT have an overlap
						const availableArtists = artists.filter((artist) => {
							const hasOverlap = appointments.some((appt) => {
								if (appt.artistId !== artist.id) return false;
								if (appt.status === "cancelled") return false;
								return isBefore(appt.start, slotEnd) && isAfter(appt.end, slotStart);
							});
							return !hasOverlap;
						});
						isSlotAvailable = availableArtists.length > 0;
					}

					if (isSlotAvailable) {
						slots.push(
							new Intl.DateTimeFormat("en-US", {
								hour: "numeric",
								minute: "numeric",
								hour12: false,
							}).format(slotStart),
						);
					}

					currentSlot = addMinutes(currentSlot, SLOT_INTERVAL);
				}

				setAvailableTimes(slots);
			} catch (error) {
				console.error("Error fetching availability:", error);
				setAvailableTimes([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAvailability();
	}, [date, durationMinutes, artistId, artists]);

	return { availableTimes, isLoading };
};
