// Types
export type { Artist, ArtistDocument, ArtistPreview, PortfolioImage, TattooStyle } from "./types";

// API - Read
export { getArtists, getArtistById } from "./api/getArtists";
export { useArtists, useArtist } from "./api/useArtists";

// API - Write
export {
	updateArtistProfile,
	uploadProfileImage,
	uploadPortfolioImage,
	deletePortfolioImage,
} from "./api/updateArtist";
export {
	useUpdateArtistProfile,
	useUploadProfileImage,
	useUploadPortfolioImage,
	useDeletePortfolioImage,
} from "./api/useUpdateArtist";
