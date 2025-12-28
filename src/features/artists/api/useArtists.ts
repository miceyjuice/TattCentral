import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getArtists, getArtistById } from "./getArtists";
import type { Artist } from "../types";

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
 * Uses cached data from artists list if available to avoid redundant fetches
 */
export function useArtist(artistId: string) {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ["artists", artistId],
		queryFn: () => getArtistById(artistId),
		enabled: !!artistId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Use data from the artists list cache if available
		initialData: () => {
			const artistsCache = queryClient.getQueryData<Artist[]>(["artists"]);
			return artistsCache?.find((artist) => artist.id === artistId) ?? undefined;
		},
		// Mark as stale if we're using initial data from list cache
		// This ensures a background refetch for potentially more complete data
		initialDataUpdatedAt: () => {
			return queryClient.getQueryState(["artists"])?.dataUpdatedAt;
		},
	});
}
