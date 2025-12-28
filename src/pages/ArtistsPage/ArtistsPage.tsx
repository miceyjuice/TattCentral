import { Users } from "lucide-react";
import { useArtists } from "@/features/artists";
import { Navigation } from "@/components/Navigation";
import { ArtistCard } from "./ArtistCard";

/**
 * Loading skeleton for artist cards
 */
function ArtistCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
			<div className="aspect-square animate-pulse bg-white/5" />
			<div className="p-4">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 animate-pulse rounded-full bg-white/5" />
					<div className="space-y-2">
						<div className="h-4 w-24 animate-pulse rounded bg-white/5" />
						<div className="h-3 w-16 animate-pulse rounded bg-white/5" />
					</div>
				</div>
				<div className="mt-3 flex gap-1.5">
					<div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
					<div className="h-5 w-20 animate-pulse rounded-full bg-white/5" />
				</div>
			</div>
		</div>
	);
}

/**
 * Empty state when no artists found
 */
function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<Users className="h-16 w-16 text-white/20" aria-hidden="true" />
			<h2 className="mt-4 text-xl font-medium text-white">No artists yet</h2>
			<p className="mt-2 text-white/60">Check back soon for our talented team!</p>
		</div>
	);
}

/**
 * Error state
 */
function ErrorState({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="rounded-full bg-red-500/20 p-4">
				<Users className="h-8 w-8 text-red-400" aria-hidden="true" />
			</div>
			<h2 className="mt-4 text-xl font-medium text-white">Unable to load artists</h2>
			<p className="mt-2 text-white/60">{message}</p>
		</div>
	);
}

/**
 * Public artists listing page
 * Displays all artists with their portfolio previews
 */
export function ArtistsPage() {
	const { data: artists, isLoading, error } = useArtists();

	return (
		<div className="min-h-screen bg-[#0a0a0a]">
			<Navigation />

			<main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-10 text-center">
					<h1 className="text-3xl font-bold text-white sm:text-4xl">Our Artists</h1>
					<p className="mt-3 text-lg text-white/60">Meet our talented team of tattoo artists</p>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<ArtistCardSkeleton key={i} />
						))}
					</div>
				)}

				{/* Error State */}
				{error && <ErrorState message={error.message} />}

				{/* Empty State */}
				{!isLoading && !error && artists?.length === 0 && <EmptyState />}

				{/* Artists Grid */}
				{!isLoading && !error && artists && artists.length > 0 && (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{artists.map((artist) => (
							<ArtistCard key={artist.id} artist={artist} />
						))}
					</div>
				)}
			</main>
		</div>
	);
}
