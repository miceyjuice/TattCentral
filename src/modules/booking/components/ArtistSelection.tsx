import { cn } from "@/lib/utils";
import { useArtists } from "../hooks/useArtists";
import { User } from "lucide-react";

interface ArtistSelectionProps {
	selectedArtistId: string | null;
	onSelect: (artistId: string | null) => void;
}

export const ArtistSelection = ({ selectedArtistId, onSelect }: ArtistSelectionProps) => {
	const { data: artists, isLoading } = useArtists();

	if (isLoading) {
		return <div className="text-soft-white/50 animate-pulse">Loading artists...</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{/* Any Artist Option */}
			<button
				type="button"
				onClick={() => onSelect(null)}
				className={cn(
					"flex flex-col items-center justify-center gap-3 rounded-xl border p-6 transition-all",
					selectedArtistId === null
						? "border-fire-sunset bg-fire-sunset/10 ring-fire-sunset ring-1"
						: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
				)}
			>
				<div className="bg-fire-sunset/20 flex h-12 w-12 items-center justify-center rounded-full">
					<User className="text-fire-sunset h-6 w-6" />
				</div>
				<div className="text-center">
					<span className="text-soft-white block font-medium">Any Artist</span>
					<span className="text-soft-white/60 text-xs">Earliest availability</span>
				</div>
			</button>

			{/* Specific Artists */}
			{artists?.map((artist) => (
				<button
					key={artist.id}
					type="button"
					onClick={() => onSelect(artist.id)}
					className={cn(
						"flex flex-col items-center justify-center gap-3 rounded-xl border p-6 transition-all",
						selectedArtistId === artist.id
							? "border-fire-sunset bg-fire-sunset/10 ring-fire-sunset ring-1"
							: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
					)}
				>
					<div className="bg-fire-sunset/20 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full">
						{/* Placeholder for avatar if we had one, using initials for now */}
						<span className="text-fire-sunset font-bold">
							{artist.firstName[0]}
							{artist.lastName[0]}
						</span>
					</div>
					<div className="text-center">
						<span className="text-soft-white block font-medium">
							{artist.firstName} {artist.lastName}
						</span>
						<span className="text-soft-white/60 text-xs">Tattoo Artist</span>
					</div>
				</button>
			))}
		</div>
	);
};
