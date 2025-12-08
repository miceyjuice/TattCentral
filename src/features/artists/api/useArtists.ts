import { useQuery } from "@tanstack/react-query";
import { getArtists, getArtistById } from "./getArtists";

/**
 * Hook to fetch all artists
 * Used for the public artists listing page
 */
export function useArtists() {
	return useQuery({
		queryKey: ["artists"],
		queryFn: getArtists,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch a single artist by ID
 * Used for the artist profile page
 */
export function useArtist(artistId: string) {
	return useQuery({
		queryKey: ["artist", artistId],
		queryFn: () => getArtistById(artistId),
		enabled: !!artistId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
