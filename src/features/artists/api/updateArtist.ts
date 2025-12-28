import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { PortfolioImage, TattooStyle } from "../types";
import { Timestamp } from "firebase/firestore";

/**
 * Gets the file extension from MIME type, falling back to filename extension
 */
function getFileExtension(file: File): string {
	// Map common image MIME types to extensions
	const mimeToExtension: Record<string, string> = {
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/gif": "gif",
		"image/webp": "webp",
		"image/svg+xml": "svg",
		"image/bmp": "bmp",
		"image/tiff": "tiff",
	};

	// Prefer MIME type for accuracy
	if (file.type && mimeToExtension[file.type]) {
		return mimeToExtension[file.type];
	}

	// Fall back to filename extension
	const filenameExt = file.name.split(".").pop()?.toLowerCase();
	if (filenameExt && filenameExt.length <= 5) {
		return filenameExt;
	}

	// Default to jpg for unknown types
	return "jpg";
}

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
	// Generate unique filename with extension from MIME type
	const extension = getFileExtension(file);
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
	// Generate unique ID and filename with extension from MIME type
	const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	const extension = getFileExtension(file);
	const storagePath = `portfolio/${artistId}/${imageId}.${extension}`;

	// Upload to Firebase Storage
	const storageRef = ref(storage, storagePath);
	await uploadBytes(storageRef, file);

	// Get download URL
	const url = await getDownloadURL(storageRef);

	// Create portfolio image object (only include caption if defined)
	const portfolioImage: PortfolioImage = {
		id: imageId,
		url,
		storagePath,
		createdAt: Timestamp.now(),
		...(caption !== undefined && { caption }),
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
