import { Link } from "react-router-dom";

interface NavigationProps {
	showBookNow?: boolean;
}

export const Navigation = ({ showBookNow = true }: NavigationProps) => {
	return (
		<nav className="flex w-full items-center justify-between px-8 py-4 text-white">
			<Link to="/" className="flex items-center gap-2">
				{/* <img src="/logo.png" alt="Logo" className="logo" /> */}
				<span className="font-inter font-bold tracking-wider">TattCentral</span>
			</Link>
			<ul className="flex items-center gap-6">
				<li className="inline-block">
					<Link to="/about" className="font-inter text-white hover:text-gray-200">
						About
					</Link>
				</li>
				<li className="inline-block">
					<Link to="/artists" className="text-white hover:text-gray-200">
						Our artists
					</Link>
				</li>
				<li className="inline-block">
					<Link to="/contact" className="text-white hover:text-gray-200">
						Contact
					</Link>
				</li>
				<li className="inline-block">
					<Link to="/our-work" className="text-white hover:text-gray-200">
						Our work
					</Link>
				</li>
				{showBookNow && (
					<li>
						<Link
							to="/booking"
							className="block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						>
							Book now
						</Link>
					</li>
				)}
			</ul>
		</nav>
	);
};
