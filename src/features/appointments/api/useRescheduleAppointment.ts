import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rescheduleAppointment } from "./rescheduleAppointment";

/**
 * React Query mutation hook for rescheduling appointments.
 * Invalidates appointment queries on success and shows toast notifications.
 */
export function useRescheduleAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rescheduleAppointment,
		onSuccess: () => {
			// Invalidate all appointment-related queries to refresh the UI
			queryClient.invalidateQueries({ queryKey: ["appointments"] });
			queryClient.invalidateQueries({ queryKey: ["appointment"] });
			toast.success("Appointment rescheduled successfully");
		},
		onError: (error) => {
			console.error("Failed to reschedule appointment:", error);
			toast.error("Failed to reschedule appointment. Please try again.");
		},
	});
}
