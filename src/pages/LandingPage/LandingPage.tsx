const LandingPage = () => {
	return (
		<>
			<Navigation />
			<main className="flex flex-col gap-8 items-center justify-center max-w-7xl mx-auto w-full my-10">
				<HeroSection />
				<RecentWorkSection />
			</main>
		</>
	);
};

const Navigation = () => {
	return (
		<nav className="flex justify-between items-center py-4 px-8 text-white w-full">
			{/* <img src="/logo.png" alt="Logo" className="logo" /> */}
			<span className="font-inter font-bold tracking-wider">TattCentral</span>
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
					<a href="/login" className="text-white hover:text-gray-200">
						Login
					</a>
				</li>
				<li>
					<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Book now</button>
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

const RecentWorkSection = () => {
	return (
		<section className="flex flex-col gap-4 w-full px-10 mt-10">
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

export default LandingPage;
