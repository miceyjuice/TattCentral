import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";
import { useArtist } from "@/features/artists";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";

/**
 * Portfolio gallery component
 * Displays artist's work in a responsive grid
 */
function PortfolioGallery({ images }: { images: { id: string; url: string; caption?: string }[] }) {
	if (images.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="rounded-full bg-white/5 p-4">
					<User className="h-8 w-8 text-white/20" aria-hidden="true" />
				</div>
				<p className="mt-4 text-white/60">No portfolio images yet</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{images.map((image) => (
				<div
					key={image.id}
					className="group relative aspect-square overflow-hidden rounded-lg bg-[#1a1a1a]"
				>
					<img
						src={image.url}
						alt={image.caption || "Portfolio work"}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
					{image.caption && (
						<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
							<p className="text-sm text-white">{image.caption}</p>
						</div>
					)}
				</div>
			))}
		</div>
	);
}

/**
 * Loading state for the profile page
 */
function LoadingState() {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center">
			<Loader2 className="h-8 w-8 animate-spin text-white/60" aria-hidden="true" />
			<p className="mt-4 text-white/60" role="status">
				Loading artist profile...
			</p>
		</div>
	);
}

/**
 * Error/Not found state
 */
function NotFoundState() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center text-center">
			<div className="rounded-full bg-red-500/20 p-4">
				<User className="h-8 w-8 text-red-400" aria-hidden="true" />
			</div>
			<h2 className="mt-4 text-xl font-medium text-white">Artist not found</h2>
			<p className="mt-2 text-white/60">This artist profile doesn't exist or has been removed.</p>
			<Button variant="outline" className="mt-6" onClick={() => navigate("/artists")}>
				View all artists
			</Button>
		</div>
	);
}

/**
 * Artist profile page with bio and portfolio gallery
 */
export function ArtistProfilePage() {
	const { artistId } = useParams<{ artistId: string }>();
	const { data: artist, isLoading, error } = useArtist(artistId ?? "");

	const fullName = artist ? `${artist.firstName} ${artist.lastName}` : "";

	return (
		<div className="min-h-screen bg-[#0a0a0a]">
			<Navigation />

			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Back link */}
				<Link
					to="/artists"
					className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back to artists
				</Link>

				{/* Loading */}
				{isLoading && <LoadingState />}

				{/* Error/Not Found */}
				{(error || (!isLoading && !artist)) && <NotFoundState />}

				{/* Artist Profile */}
				{artist && (
					<>
						{/* Header */}
						<div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
							{/* Profile Image */}
							<div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#1a1a1a] sm:h-32 sm:w-32">
								{artist.profileImageUrl ? (
									<img
										src={artist.profileImageUrl}
										alt={fullName}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center">
										<span className="text-2xl font-medium text-white/60 sm:text-3xl">
											{artist.firstName[0]}
											{artist.lastName[0]}
										</span>
									</div>
								)}
							</div>

							{/* Info */}
							<div className="flex-1">
								<h1 className="text-2xl font-bold text-white sm:text-3xl">{fullName}</h1>
								<p className="mt-1 text-white/60">Tattoo Artist</p>

								{/* Specialties */}
								{artist.specialties && artist.specialties.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-2">
										{artist.specialties.map((specialty) => (
											<span
												key={specialty}
												className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80"
											>
												{specialty}
											</span>
										))}
									</div>
								)}
							</div>

							{/* Book Button */}
							<Link to={`/booking?artist=${artist.id}`}>
								<Button size="lg" className="gap-2">
									<Calendar className="h-4 w-4" aria-hidden="true" />
									Book with {artist.firstName}
								</Button>
							</Link>
						</div>

						{/* Bio */}
						{artist.bio && (
							<div className="mb-10">
								<h2 className="mb-3 text-lg font-medium text-white">About</h2>
								<p className="leading-relaxed text-white/70">{artist.bio}</p>
							</div>
						)}

						{/* Portfolio */}
						<div>
							<h2 className="mb-4 text-lg font-medium text-white">
								Portfolio
								{artist.portfolioImages && artist.portfolioImages.length > 0 && (
									<span className="ml-2 text-white/50">
										({artist.portfolioImages.length})
									</span>
								)}
							</h2>
							<PortfolioGallery images={artist.portfolioImages ?? []} />
						</div>
					</>
				)}
			</main>
		</div>
	);
}
