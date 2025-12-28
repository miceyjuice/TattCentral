import { User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Artist } from "@/features/artists";

interface AdminArtistCardProps {
	artist: Artist;
	onEdit: (artist: Artist) => void;
}

/**
 * Artist card for admin panel
 * Shows artist info with edit action
 */
export function AdminArtistCard({ artist, onEdit }: AdminArtistCardProps) {
	const fullName = `${artist.firstName} ${artist.lastName}`;
	const portfolioCount = artist.portfolioImages?.length ?? 0;
	const specialtyCount = artist.specialties?.length ?? 0;

	return (
		<div className="group overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] transition-colors hover:border-white/20">
			{/* Profile Image */}
			<div className="relative aspect-square bg-[#2a2a2a]">
				{artist.profileImageUrl ? (
					<img src={artist.profileImageUrl} alt={fullName} className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<User className="h-16 w-16 text-white/20" aria-hidden="true" />
					</div>
				)}

				{/* Edit overlay on hover */}
				<div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
					<Button
						variant="outline"
						size="sm"
						className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
						onClick={() => onEdit(artist)}
					>
						<Pencil className="h-4 w-4" aria-hidden="true" />
						Edit Profile
					</Button>
				</div>
			</div>

			{/* Artist Info */}
			<div className="p-4">
				<h3 className="font-medium text-white">{fullName}</h3>
				<p className="mt-1 text-sm text-white/60">{artist.email}</p>

				{/* Stats */}
				<div className="mt-3 flex items-center gap-4 text-xs text-white/50">
					<span>
						{portfolioCount} portfolio image{portfolioCount !== 1 ? "s" : ""}
					</span>
					<span>
						{specialtyCount} specialt{specialtyCount !== 1 ? "ies" : "y"}
					</span>
				</div>

				{/* Specialties preview */}
				{artist.specialties && artist.specialties.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						{artist.specialties.slice(0, 3).map((specialty) => (
							<span
								key={specialty}
								className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
							>
								{specialty}
							</span>
						))}
						{artist.specialties.length > 3 && (
							<span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
								+{artist.specialties.length - 3}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
