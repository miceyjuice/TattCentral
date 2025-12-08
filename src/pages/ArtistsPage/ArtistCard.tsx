import { Link } from "react-router-dom";
import { User } from "lucide-react";
import type { Artist } from "@/features/artists";

interface ArtistCardProps {
	artist: Artist;
}

/**
 * Artist preview card for the artists listing page
 * Shows profile image, name, specialties, and portfolio preview
 */
export function ArtistCard({ artist }: ArtistCardProps) {
	const fullName = `${artist.firstName} ${artist.lastName}`;
	const portfolioCount = artist.portfolioImages?.length ?? 0;
	const previewImage = artist.portfolioImages?.[0]?.url;

	return (
		<Link
			to={`/artists/${artist.id}`}
			className="group block overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] transition-all hover:border-white/20 hover:bg-[#222]"
		>
			{/* Portfolio Preview Image */}
			<div className="relative aspect-square overflow-hidden bg-[#0a0a0a]">
				{previewImage ? (
					<img
						src={previewImage}
						alt={`Work by ${fullName}`}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<User className="h-16 w-16 text-white/20" aria-hidden="true" />
					</div>
				)}

				{/* Portfolio count badge */}
				{portfolioCount > 0 && (
					<div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
						{portfolioCount} {portfolioCount === 1 ? "work" : "works"}
					</div>
				)}
			</div>

			{/* Artist Info */}
			<div className="p-4">
				{/* Profile Image & Name */}
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 overflow-hidden rounded-full bg-[#0a0a0a]">
						{artist.profileImageUrl ? (
							<img
								src={artist.profileImageUrl}
								alt={fullName}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center">
								<span className="text-sm font-medium text-white/60">
									{artist.firstName[0]}
									{artist.lastName[0]}
								</span>
							</div>
						)}
					</div>
					<div>
						<h3 className="font-medium text-white">{fullName}</h3>
						<p className="text-sm text-white/50">Tattoo Artist</p>
					</div>
				</div>

				{/* Specialties */}
				{artist.specialties && artist.specialties.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						{artist.specialties.slice(0, 3).map((specialty) => (
							<span
								key={specialty}
								className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
							>
								{specialty}
							</span>
						))}
						{artist.specialties.length > 3 && (
							<span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/60">
								+{artist.specialties.length - 3}
							</span>
						)}
					</div>
				)}
			</div>
		</Link>
	);
}
