import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

type UpdateStatusParams = {
	appointmentId: string;
	status: "upcoming" | "cancelled";
	successMessage?: string;
};

export const useUpdateAppointmentStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ appointmentId, status }: UpdateStatusParams) => {
			const appointmentRef = doc(db, "appointments", appointmentId);
			await updateDoc(appointmentRef, { status });
		},
		onSuccess: (_, { status, successMessage }) => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] });
			toast.success(successMessage ?? `Appointment ${status === "upcoming" ? "approved" : "declined"}`);
		},
		onError: (error) => {
			console.error("Error updating appointment status:", error);
			toast.error("Failed to update appointment status");
		},
	});
};
