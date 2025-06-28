const LandingPage = () => {
	return (
		<>
			<Navigation />
			<main className="flex flex-col gap-20 items-center justify-center max-w-7xl mx-auto w-full my-10">
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
		<nav className="flex justify-between items-center py-4 px-8 text-white w-full">
			<a href="/" className="flex items-center gap-2">
				{/* <img src="/logo.png" alt="Logo" className="logo" /> */}
				<span className="font-inter font-bold tracking-wider">TattCentral</span>
			</a>
			<ul className="flex gap-6 items-center">
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
					<a href="/booking" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
			<div className="relative flex flex-col w-full gap-2 items-center justify-center text-white bg-[url('/src/assets/images/tattoo-studio-interior.jpg')] bg-cover bg-center rounded-4xl min-h-[50rem] after:absolute after:inset-0 after:bg-black/50 after:content-[''] after:rounded-4xl">
				<h1 className="z-20 text-4xl font-bold mb-4">Book your next masterpiece</h1>
				<p className="z-20 text-lg">Your one-stop destination for all things tattoo.</p>
				<button className="z-20 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Book now</button>
			</div>
		</section>
	);
};

const TattooWorkSection = () => {
	return (
		<section className="flex flex-col gap-4 w-full px-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Recent work</h2>
				<a href="/gallery" className="hover:underline">
					View all
				</a>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
				<div className=" rounded-lg">
					<img src="src/assets/images/tattoo-example-1.png" alt="Tattoo 1" className="w-full h-auto rounded-lg" />
				</div>
				<div className="rounded-lg">
					<img src="src/assets/images/tattoo-example-2.png" alt="Tattoo 2" className="w-full h-auto rounded-lg" />
				</div>
				<div className="rounded-lg">
					<img src="src/assets/images/tattoo-example-3.png" alt="Tattoo 3" className="w-full h-auto rounded-lg" />
				</div>
				<div className="rounded-lg">
					<img src="src/assets/images/tattoo-example-4.png" alt="Tattoo 4" className="w-full h-auto rounded-lg" />
				</div>
				<div className="rounded-lg">
					<img src="src/assets/images/tattoo-example-5.png" alt="Tattoo 5" className="w-full h-auto rounded-lg" />
				</div>
			</div>
		</section>
	);
};

const OurArtistsSection = () => {
	return (
		<section className="flex flex-col gap-4 w-full px-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Our artists</h2>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
				<div className="flex flex-col gap-4">
					<div className="rounded-full">
						<img src="src/assets/images/artist-1.png" alt="Tattoo 1" className="w-full h-auto rounded-full" />
					</div>
					<div className="text-center">
						<h3 className="text-lg font-semibold">Sophia Bennett</h3>
						<p className="text-sm text-gray-500">Specialty: Black & Grey</p>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="rounded-full">
						<img src="src/assets/images/artist-2.png" alt="Tattoo 2" className="w-full h-auto rounded-full" />
					</div>
					<div className="text-center">
						<h3 className="text-lg font-semibold">Liam Carter</h3>
						<p className="text-sm text-gray-500">Specialty: Color</p>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="rounded-full">
						<img src="src/assets/images/artist-3.png" alt="Tattoo 3" className="w-full h-auto rounded-full" />
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
		<section className="flex flex-col gap-4 w-full px-10">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Client testimonials</h2>
			</div>
			<div className="relative flex flex-col w-full gap-2 justify-end p-12 text-white bg-[url('/src/assets/images/tattoo-studio-client-testimony-bg.jpg')] bg-cover bg-center rounded-4xl min-h-[30rem] after:absolute after:inset-0 after:bg-black/50 after:content-[''] after:rounded-4xl">
				<h4 className="z-20 text-lg font-bold">John Doe</h4>
				<p className="z-20 text-lg opacity-75 max-w-2/3">
					I had an amazing experience at TattCentral! The artists are incredibly talented and made me feel comfortable throughout
					the process. Highly recommend!
				</p>
			</div>
		</section>
	);
};

const Footer = () => {
	return (
		<footer className="flex flex-col gap-2 items-center justify-center py-10  text-white/80">
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
