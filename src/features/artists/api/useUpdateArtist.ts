import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateArtistProfile, uploadProfileImage, uploadPortfolioImage, deletePortfolioImage } from "./updateArtist";
import type { PortfolioImage, TattooStyle } from "../types";

/**
 * Hook for updating artist profile (bio, specialties)
 */
export function useUpdateArtistProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ artistId, data }: { artistId: string; data: { bio?: string; specialties?: TattooStyle[] } }) =>
			updateArtistProfile(artistId, data),
		onSuccess: () => {
			toast.success("Profile updated", {
				description: "Artist profile has been saved.",
			});
			void queryClient.invalidateQueries({ queryKey: ["artists"] });
		},
		onError: (error) => {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile", {
				description: "Please try again.",
			});
		},
	});
}

/**
 * Hook for uploading artist profile image
 */
export function useUploadProfileImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ artistId, file }: { artistId: string; file: File }) => uploadProfileImage(artistId, file),
		onSuccess: () => {
			toast.success("Profile image updated", {
				description: "The new profile picture has been saved.",
			});
			void queryClient.invalidateQueries({ queryKey: ["artists"] });
		},
		onError: (error) => {
			console.error("Failed to upload profile image:", error);
			toast.error("Failed to upload image", {
				description: "Please try again.",
			});
		},
	});
}

/**
 * Hook for uploading portfolio image
 */
export function useUploadPortfolioImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ artistId, file, caption }: { artistId: string; file: File; caption?: string }) =>
			uploadPortfolioImage(artistId, file, caption),
		onSuccess: () => {
			toast.success("Portfolio image added", {
				description: "The image has been added to the portfolio.",
			});
			void queryClient.invalidateQueries({ queryKey: ["artists"] });
		},
		onError: (error) => {
			console.error("Failed to upload portfolio image:", error);
			toast.error("Failed to upload image", {
				description: "Please try again.",
			});
		},
	});
}

/**
 * Hook for deleting portfolio image
 */
export function useDeletePortfolioImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ artistId, image }: { artistId: string; image: PortfolioImage }) =>
			deletePortfolioImage(artistId, image),
		onSuccess: () => {
			toast.success("Image deleted", {
				description: "The portfolio image has been removed.",
			});
			void queryClient.invalidateQueries({ queryKey: ["artists"] });
		},
		onError: (error) => {
			console.error("Failed to delete portfolio image:", error);
			toast.error("Failed to delete image", {
				description: "Please try again.",
			});
		},
	});
}
