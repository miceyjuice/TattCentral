import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Artist, ArtistDocument } from "../types";

/**
 * Fetches all artists from Firestore
 * Used for the public artists listing page
 */
export async function getArtists(): Promise<Artist[]> {
	const q = query(collection(db, "users"), where("role", "==", "artist"));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...(doc.data() as ArtistDocument),
	}));
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

	return {
		id: docSnap.id,
		...data,
	};
}
