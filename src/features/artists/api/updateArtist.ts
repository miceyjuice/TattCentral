import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { PortfolioImage, TattooStyle } from "../types";
import { Timestamp } from "firebase/firestore";

/** Supported image MIME types mapped to file extensions */
const SUPPORTED_IMAGE_TYPES: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/jpg": "jpg",
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
};

/**
 * Validates that the file is a supported image type and returns the extension
 * @throws Error if file type is not supported
 */
function getValidatedImageExtension(file: File): string {
	// Prefer MIME type for accuracy and security
	if (file.type && SUPPORTED_IMAGE_TYPES[file.type]) {
		return SUPPORTED_IMAGE_TYPES[file.type];
	}

	// If MIME type is missing/invalid, check filename extension as fallback
	const filenameExt = file.name.split(".").pop()?.toLowerCase();
	const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

	if (filenameExt && validExtensions.includes(filenameExt)) {
		return filenameExt === "jpeg" ? "jpg" : filenameExt;
	}

	throw new Error(`Unsupported image type: ${file.type || "unknown"}. ` + `Supported types: JPEG, PNG, GIF, WebP`);
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

	// Filter out undefined values - Firestore doesn't accept undefined
	const cleanedData = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

	if (Object.keys(cleanedData).length === 0) {
		return; // Nothing to update
	}

	await updateDoc(artistRef, cleanedData);
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

	// Validate file type and get extension
	const extension = getValidatedImageExtension(file);
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
	// Validate file type and generate unique ID
	const extension = getValidatedImageExtension(file);
	const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	const storagePath = `portfolio/${artistId}/${imageId}.${extension}`;

	// Upload to Firebase Storage
	const storageRef = ref(storage, storagePath);
	await uploadBytes(storageRef, file);

	// Get download URL
	const url = await getDownloadURL(storageRef);

	// Normalize caption: trim whitespace and convert empty to undefined
	const normalizedCaption = caption?.trim() || undefined;

	// Create portfolio image object (only include caption if non-empty)
	const portfolioImage: PortfolioImage = {
		id: imageId,
		url,
		storagePath,
		createdAt: Timestamp.now(),
		...(normalizedCaption && { caption: normalizedCaption }),
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
