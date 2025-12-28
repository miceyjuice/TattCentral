import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
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
 * Extracts the storage path from a Firebase Storage download URL
 * Returns null if the URL is not a valid Firebase Storage URL
 */
function extractStoragePathFromUrl(url: string): string | null {
	try {
		// Firebase Storage URLs contain the path after /o/ and before ?
		// Example: https://firebasestorage.googleapis.com/v0/b/bucket/o/profiles%2FartistId%2Fprofile.jpg?alt=media
		const match = url.match(/\/o\/([^?]+)/);
		if (match?.[1]) {
			return decodeURIComponent(match[1]);
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Uploads a profile image for an artist
 * Deletes the old profile image if one exists
 * Returns the download URL
 */
export async function uploadProfileImage(artistId: string, file: File): Promise<string> {
	// Fetch current profile to get old image URL
	const artistRef = doc(db, "users", artistId);
	const artistDoc = await getDoc(artistRef);
	const currentProfileImageUrl = artistDoc.data()?.profileImageUrl as string | undefined;

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
	await updateDoc(artistRef, {
		profileImageUrl: downloadUrl,
	});

	// Delete old profile image if it exists (after successful update)
	if (currentProfileImageUrl) {
		const oldStoragePath = extractStoragePathFromUrl(currentProfileImageUrl);
		if (oldStoragePath) {
			try {
				const oldStorageRef = ref(storage, oldStoragePath);
				await deleteObject(oldStorageRef);
			} catch (error) {
				// Old file might not exist, log warning but don't fail
				console.warn("Failed to delete old profile image:", error);
			}
		}
	}

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
