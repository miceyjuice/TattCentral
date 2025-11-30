import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";

type UpdateStatusParams = {
	appointmentId: string;
	status: "upcoming" | "cancelled";
	successMessage?: string;
};

/**
 * Deletes reference images from Firebase Storage.
 * Images are only deleted when declining/cancelling a pending appointment.
 */
async function deleteReferenceImages(referenceImageUrls: string[]) {
	if (!referenceImageUrls || referenceImageUrls.length === 0) return;

	await Promise.all(
		referenceImageUrls.map(async (url) => {
			try {
				const imageRef = ref(storage, url);
				await deleteObject(imageRef);
			} catch (error) {
				// Log but don't throw - we still want to cancel the appointment even if image deletion fails
				console.error(`Failed to delete image: ${url}`, error);
			}
		}),
	);
}

export const useUpdateAppointmentStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ appointmentId, status }: UpdateStatusParams) => {
			const appointmentRef = doc(db, "appointments", appointmentId);
			const appointmentSnap = await getDoc(appointmentRef);
			const appointmentData = appointmentSnap.data();

			// If cancelling a pending appointment, delete reference images from storage
			if (status === "cancelled" && appointmentData?.status === "pending") {
				const referenceImageUrls = appointmentData?.referenceImageUrls as string[] | undefined;

				if (referenceImageUrls && referenceImageUrls.length > 0) {
					await deleteReferenceImages(referenceImageUrls);
				}

				// Update status and remove referenceImageUrls field
				await updateDoc(appointmentRef, {
					status,
					referenceImageUrls: deleteField(),
				});
			} else {
				await updateDoc(appointmentRef, { status });
			}
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
