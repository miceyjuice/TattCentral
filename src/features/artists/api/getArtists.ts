import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Artist, ArtistDocument, PortfolioImage } from "../types";

/**
 * Sorts portfolio images by createdAt descending (newest first)
 */
function sortPortfolioImages(images?: PortfolioImage[]): PortfolioImage[] | undefined {
	if (!images || images.length === 0) {
		return images;
	}
	return [...images].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

/**
 * Transforms artist document data, including sorting portfolio images
 */
function transformArtistData(id: string, data: ArtistDocument): Artist {
	return {
		id,
		...data,
		portfolioImages: sortPortfolioImages(data.portfolioImages),
	};
}

/**
 * Fetches all artists from Firestore
 * Used for the public artists listing page
 */
export async function getArtists(): Promise<Artist[]> {
	const q = query(collection(db, "users"), where("role", "==", "artist"));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => transformArtistData(doc.id, doc.data() as ArtistDocument));
}

/**
 * Fetches a single artist by ID
 * Used for the artist profile page
 */
export async function getArtistById(artistId: string): Promise<Artist | null> {
	const docRef = doc(db, "users", artistId);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) {
		return null;
	}

	const data = docSnap.data() as ArtistDocument;

	// Verify this is actually an artist
	if (data.role !== "artist") {
		return null;
	}

	return transformArtistData(docSnap.id, data);
}
