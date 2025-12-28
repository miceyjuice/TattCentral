import type { Timestamp } from "firebase/firestore";

/**
 * Portfolio image stored in artist document
 */
export interface PortfolioImage {
	id: string;
	url: string;
	storagePath: string;
	caption?: string;
	createdAt: Timestamp;
}

/**
 * Artist specialties/styles
 */
export type TattooStyle =
	| "Traditional"
	| "Neo-Traditional"
	| "Realism"
	| "Blackwork"
	| "Watercolor"
	| "Japanese"
	| "Tribal"
	| "Geometric"
	| "Minimalist"
	| "Portrait"
	| "Lettering"
	| "Other";

/**
 * Artist document from Firestore (extends UserDocument)
 */
export interface ArtistDocument {
	email: string;
	firstName: string;
	lastName: string;
	role: "artist";
	bio?: string;
	specialties?: TattooStyle[];
	portfolioImages?: PortfolioImage[];
	profileImageUrl?: string;
}

/**
 * Artist with ID (for frontend use)
 */
export interface Artist extends ArtistDocument {
	id: string;
}

/**
 * Artist card preview (minimal data for listing)
 */
export interface ArtistPreview {
	id: string;
	firstName: string;
	lastName: string;
	profileImageUrl?: string;
	specialties?: TattooStyle[];
	portfolioImageCount: number;
}
