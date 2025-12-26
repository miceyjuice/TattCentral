import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { PortfolioImage, TattooStyle } from "../types";
import { Timestamp } from "firebase/firestore";

/**
 * Updates an artist's profile (bio, specialties)
 */
export async function updateArtistProfile(
	artistId: string,
	data: {
		bio?: string;
		specialties?: TattooStyle[];
	},
): Promise<void> {
	const artistRef = doc(db, "users", artistId);
	await updateDoc(artistRef, data);
}

/**
 * Uploads a profile image for an artist
 * Returns the download URL
 */
export async function uploadProfileImage(artistId: string, file: File): Promise<string> {
	// Generate unique filename with extension
	const extension = file.name.split(".").pop() ?? "jpg";
	const filename = `profile_${Date.now()}.${extension}`;
	const storagePath = `profiles/${artistId}/${filename}`;

	// Upload to Firebase Storage
	const storageRef = ref(storage, storagePath);
	await uploadBytes(storageRef, file);

	// Get download URL
	const downloadUrl = await getDownloadURL(storageRef);

	// Update user document with new profile image URL
	const artistRef = doc(db, "users", artistId);
	await updateDoc(artistRef, {
		profileImageUrl: downloadUrl,
	});

	return downloadUrl;
}

/**
 * Uploads a portfolio image for an artist
 * Returns the created PortfolioImage object
 */
export async function uploadPortfolioImage(artistId: string, file: File, caption?: string): Promise<PortfolioImage> {
	// Generate unique ID and filename
	const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	const extension = file.name.split(".").pop() ?? "jpg";
	const storagePath = `portfolio/${artistId}/${imageId}.${extension}`;

	// Upload to Firebase Storage
	const storageRef = ref(storage, storagePath);
	await uploadBytes(storageRef, file);

	// Get download URL
	const url = await getDownloadURL(storageRef);

	// Create portfolio image object
	const portfolioImage: PortfolioImage = {
		id: imageId,
		url,
		storagePath,
		caption,
		createdAt: Timestamp.now(),
	};

	// Add to user's portfolioImages array
	const artistRef = doc(db, "users", artistId);
	await updateDoc(artistRef, {
		portfolioImages: arrayUnion(portfolioImage),
	});

	return portfolioImage;
}

/**
 * Deletes a portfolio image for an artist
 * Removes from both Storage and Firestore
 */
export async function deletePortfolioImage(artistId: string, image: PortfolioImage): Promise<void> {
	// Delete from Firebase Storage
	const storageRef = ref(storage, image.storagePath);
	try {
		await deleteObject(storageRef);
	} catch (error) {
		// File might not exist, continue with Firestore cleanup
		console.warn("Failed to delete image from storage:", error);
	}

	// Remove from user's portfolioImages array
	const artistRef = doc(db, "users", artistId);
	await updateDoc(artistRef, {
		portfolioImages: arrayRemove(image),
	});
}
