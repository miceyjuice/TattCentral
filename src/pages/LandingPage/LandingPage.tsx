import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useArtists } from "@/features/artists";
import { User } from "lucide-react";

const LandingPage = () => {
	return (
		<>
			<Navigation />
			<main className="mx-auto my-10 flex w-full max-w-[1440px] flex-col items-center justify-center gap-20">
				<HeroSection />
				<TattooWorkSection />
				<OurArtistsSection />
				<ClientTestimonialsSection />
			</main>
			<Footer />
		</>
	);
};

const HeroSection = () => {
	return (
		<section className="w-full px-10">
			<div className="relative flex min-h-[50rem] w-full flex-col items-center justify-center gap-2 rounded-4xl bg-[url('/src/assets/images/tattoo-studio-interior.jpg')] bg-cover bg-center text-white after:absolute after:inset-0 after:rounded-4xl after:bg-black/50 after:content-['']">
				<h1 className="z-20 mb-4 text-4xl font-bold">Book your next masterpiece</h1>
				<p className="z-20 text-lg">Your one-stop destination for all things tattoo.</p>
				<button className="z-20 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Book now</button>
			</div>
		</section>
	);
};

const TattooWorkSection = () => {
	return (
		<section className="flex w-full flex-col gap-4 px-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Recent work</h2>
				<a href="/gallery" className="hover:underline">
					View all
				</a>
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
				<div className="rounded-lg">
					<img
						src="src/assets/images/tattoo-example-1.png"
						alt="Tattoo 1"
						className="h-auto w-full rounded-lg"
					/>
				</div>
				<div className="rounded-lg">
					<img
						src="src/assets/images/tattoo-example-2.png"
						alt="Tattoo 2"
						className="h-auto w-full rounded-lg"
					/>
				</div>
				<div className="rounded-lg">
					<img
						src="src/assets/images/tattoo-example-3.png"
						alt="Tattoo 3"
						className="h-auto w-full rounded-lg"
					/>
				</div>
				<div className="rounded-lg">
					<img
						src="src/assets/images/tattoo-example-4.png"
						alt="Tattoo 4"
						className="h-auto w-full rounded-lg"
					/>
				</div>
				<div className="rounded-lg">
					<img
						src="src/assets/images/tattoo-example-5.png"
						alt="Tattoo 5"
						className="h-auto w-full rounded-lg"
					/>
				</div>
			</div>
		</section>
	);
};

const OurArtistsSection = () => {
	const { data: artists, isLoading } = useArtists();

	// Show max 5 artists on landing page
	const displayedArtists = artists?.slice(0, 5) ?? [];

	return (
		<section className="flex w-full flex-col gap-4 px-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Our artists</h2>
				<Link
					to="/artists"
					className="text-sm text-blue-400 transition-colors hover:text-blue-300 hover:underline"
				>
					View all →
				</Link>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex animate-pulse flex-col items-center gap-4">
							<div className="h-40 w-40 rounded-full bg-white/10" />
							<div className="h-4 w-24 rounded bg-white/10" />
							<div className="h-3 w-20 rounded bg-white/10" />
						</div>
					))}
				</div>
			)}

			{/* Artists grid */}
			{!isLoading && displayedArtists.length > 0 && (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
					{displayedArtists.map((artist) => (
						<Link
							key={artist.id}
							to={`/artists/${artist.id}`}
							className="group flex flex-col items-center gap-4"
						>
							<div className="h-40 w-40 overflow-hidden rounded-full bg-[#1a1a1a] transition-transform group-hover:scale-105">
								{artist.profileImageUrl ? (
									<img
										src={artist.profileImageUrl}
										alt={`${artist.firstName} ${artist.lastName}`}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center">
										<User className="h-12 w-12 text-white/30" aria-hidden="true" />
									</div>
								)}
							</div>
							<div className="text-center">
								<h3 className="text-lg font-semibold transition-colors group-hover:text-blue-400">
									{artist.firstName} {artist.lastName}
								</h3>
								{artist.specialties && artist.specialties.length > 0 && (
									<p className="text-sm text-gray-500">{artist.specialties[0]}</p>
								)}
							</div>
						</Link>
					))}
				</div>
			)}

			{/* Empty state */}
			{!isLoading && displayedArtists.length === 0 && (
				<p className="py-8 text-center text-white/60">No artists available at the moment.</p>
			)}
		</section>
	);
};

const ClientTestimonialsSection = () => {
	return (
		<section className="flex w-full flex-col gap-4 px-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Client testimonials</h2>
			</div>
			<div className="relative flex min-h-[30rem] w-full flex-col justify-end gap-2 rounded-4xl bg-[url('/src/assets/images/tattoo-studio-client-testimony-bg.jpg')] bg-cover bg-center p-12 text-white after:absolute after:inset-0 after:rounded-4xl after:bg-black/50 after:content-['']">
				<h4 className="z-20 text-lg font-bold">John Doe</h4>
				<p className="z-20 max-w-2/3 text-lg opacity-75">
					I had an amazing experience at TattCentral! The artists are incredibly talented and made me feel
					comfortable throughout the process. Highly recommend!
				</p>
			</div>
		</section>
	);
};

const Footer = () => {
	return (
		<footer className="flex flex-col items-center justify-center gap-2 py-10 text-white/80">
			<ul className="flex gap-6">
				<li>
					<a href="/privacy-policy" className="text-lg hover:underline">
						Gallery
					</a>
				</li>
				<li>
					<a href="/terms-of-service" className="text-lg hover:underline">
						Our artists
					</a>
				</li>
				<li>
					<a href="/terms-of-service" className="text-lg hover:underline">
						Contact
					</a>
				</li>
			</ul>
			<p className="text-sm">© 2023 TattCentral. All rights reserved.</p>
		</footer>
	);
};

export default LandingPage;
