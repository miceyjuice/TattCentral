import { useQuery } from "@tanstack/react-query";
import { getAppointmentById } from "./getAppointmentById";

/**
 * React Query hook to fetch a single appointment's details.
 * Only fetches when appointmentId is provided (enabled).
 */
export const useAppointmentDetail = (appointmentId: string | null) => {
	return useQuery({
		queryKey: ["appointment", appointmentId],
		queryFn: () => getAppointmentById(appointmentId!),
		enabled: !!appointmentId,
	});
};
