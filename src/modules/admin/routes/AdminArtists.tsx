import { useState } from "react";
import { Users, AlertCircle } from "lucide-react";
import AdminHeader from "@/modules/admin/components/AdminHeader";
import { AdminArtistCard } from "@/modules/admin/components/AdminArtistCard";
import { ArtistEditSheet } from "@/modules/admin/components/ArtistEditSheet";
import { useArtists, type Artist } from "@/features/artists";

/**
 * Loading skeleton for artist cards
 */
function ArtistCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
			<div className="aspect-square animate-pulse bg-white/5" />
			<div className="p-4">
				<div className="h-5 w-32 animate-pulse rounded bg-white/5" />
				<div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/5" />
				<div className="mt-3 flex gap-4">
					<div className="h-3 w-24 animate-pulse rounded bg-white/5" />
					<div className="h-3 w-20 animate-pulse rounded bg-white/5" />
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
		<div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#1f1818]/40 p-10 text-center">
			<Users className="h-12 w-12 text-white/20" aria-hidden="true" />
			<h3 className="mt-4 text-lg font-medium text-white">No artists yet</h3>
			<p className="mt-2 text-sm text-white/60">Artists will appear here once they are added to the system.</p>
		</div>
	);
}

/**
 * Error state
 */
function ErrorState({ message }: { message: string }) {
	return (
		<div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
			<AlertCircle className="h-12 w-12 text-red-400" aria-hidden="true" />
			<h3 className="mt-4 text-lg font-medium text-white">Failed to load artists</h3>
			<p className="mt-2 text-sm text-white/60">{message}</p>
		</div>
	);
}

const AdminArtists = () => {
	const { data: artists, isLoading, error } = useArtists();
	const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
	const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

	// Get the current artist data from the query (always fresh)
	const selectedArtist = artists?.find((a) => a.id === selectedArtistId) ?? null;

	const handleEditArtist = (artist: Artist) => {
		setSelectedArtistId(artist.id);
		setIsEditSheetOpen(true);
	};

	const handleCloseSheet = () => {
		setIsEditSheetOpen(false);
		setSelectedArtistId(null);
	};

	return (
		<>
			<AdminHeader description="Manage artist profiles, portfolios, and working hours." title="Artists" />

			{/* Loading State */}
			{isLoading && (
				<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
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
				<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{artists.map((artist) => (
						<AdminArtistCard key={artist.id} artist={artist} onEdit={handleEditArtist} />
					))}
				</div>
			)}

			{/* Edit Sheet */}
			<ArtistEditSheet
				artist={selectedArtist}
				open={isEditSheetOpen}
				onOpenChange={(open) => {
					if (!open) handleCloseSheet();
				}}
			/>
		</>
	);
};

export default AdminArtists;
