const LandingPage = () => {
	return (
		<>
			<Navigation />
			<main className="flex flex-col items-center justify-center max-w-7xl mx-auto w-full mt-20">
				<HeroSection />
			</main>
		</>
	);
};

const Navigation = () => {
	return (
		<nav className="flex justify-between items-center p-4 text-white w-full">
			{/* <img src="/logo.png" alt="Logo" className="logo" /> */}
			<span className="font-inter">TattCentral</span>
			<ul className="flex space-x-4 items-center">
				<li className="inline-block mr-4">
					<a href="/about" className="font-inter text-white hover:text-gray-200">
						About
					</a>
				</li>
				<li className="inline-block mr-4">
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

export default LandingPage;
