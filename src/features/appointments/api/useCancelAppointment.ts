import { useQuery, useMutation } from "@tanstack/react-query";
import {
	getAppointmentForCancel,
	cancelAppointmentByToken,
	type CancelPageAppointment,
	type CancelAppointmentError,
} from "./cancelAppointmentByToken";

/**
 * Hook to fetch appointment data for the cancel page
 */
export function useAppointmentForCancel(appointmentId: string, token: string) {
	return useQuery({
		queryKey: ["appointment-cancel", appointmentId, token],
		queryFn: async () => {
			const result = await getAppointmentForCancel(appointmentId, token);
			if ("error" in result) {
				throw new Error(result.error);
			}
			return result.appointment;
		},
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to cancel an appointment by token
 */
export function useCancelAppointmentByToken(appointmentId: string, token: string) {
	return useMutation({
		mutationFn: async () => {
			const result = await cancelAppointmentByToken(appointmentId, token);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result;
		},
	});
}

export type { CancelPageAppointment, CancelAppointmentError };
