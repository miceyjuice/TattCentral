const LandingPage = () => {
	return (
		<>
			<Navigation />
			<main className="mx-auto my-10 flex w-full max-w-7xl flex-col items-center justify-center gap-20">
				<HeroSection />
				<TattooWorkSection />
				<OurArtistsSection />
				<ClientTestimonialsSection />
			</main>
			<Footer />
		</>
	);
};

const Navigation = () => {
	return (
		<nav className="flex w-full items-center justify-between px-8 py-4 text-white">
			<a href="/" className="flex items-center gap-2">
				{/* <img src="/logo.png" alt="Logo" className="logo" /> */}
				<span className="font-inter font-bold tracking-wider">TattCentral</span>
			</a>
			<ul className="flex items-center gap-6">
				<li className="inline-block">
					<a href="/about" className="font-inter text-white hover:text-gray-200">
						About
					</a>
				</li>
				<li className="inline-block">
					<a href="/contact" className="text-white hover:text-gray-200">
						Contact
					</a>
				</li>
				<li className="inline-block">
					<a href="/our-work" className="text-white hover:text-gray-200">
						Our work
					</a>
				</li>
				<li>
					<a href="/booking" className="block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
						Book now
					</a>
				</li>
			</ul>
		</nav>
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
	return (
		<section className="flex w-full flex-col gap-4 px-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Our artists</h2>
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
				<div className="flex flex-col gap-4">
					<div className="rounded-full">
						<img
							src="src/assets/images/artist-1.png"
							alt="Tattoo 1"
							className="h-auto w-full rounded-full"
						/>
					</div>
					<div className="text-center">
						<h3 className="text-lg font-semibold">Sophia Bennett</h3>
						<p className="text-sm text-gray-500">Specialty: Black & Grey</p>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="rounded-full">
						<img
							src="src/assets/images/artist-2.png"
							alt="Tattoo 2"
							className="h-auto w-full rounded-full"
						/>
					</div>
					<div className="text-center">
						<h3 className="text-lg font-semibold">Liam Carter</h3>
						<p className="text-sm text-gray-500">Specialty: Color</p>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="rounded-full">
						<img
							src="src/assets/images/artist-3.png"
							alt="Tattoo 3"
							className="h-auto w-full rounded-full"
						/>
					</div>
					<div className="text-center">
						<h3 className="text-lg font-semibold">Noah Smith</h3>
						<p className="text-sm text-gray-500">Specialty: Neo Traditional</p>
					</div>
				</div>
			</div>
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
