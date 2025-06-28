import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const BookingPage = () => {
	const [startDate, setStartDate] = useState<Date | null>(new Date());

	const handleSelect = (date: Date | null) => {
		if (date) {
			setStartDate(date);
		}
	};

	const addMonths = (date: Date, months: number): Date => {
		const newDate = new Date(date);
		newDate.setMonth(newDate.getMonth() + months);
		return newDate;
	};

	return (
		<>
			<Navigation />
			<main className="flex flex-col gap-20 items-center justify-center max-w-7xl mx-auto w-full my-10 px-10">
				<section className="px-10 mx-auto">
					<DatePicker
						selected={startDate}
						onSelect={handleSelect}
						minDate={new Date()}
						maxDate={addMonths(new Date(), 5)}
						startDate={startDate}
						inline
						showDisabledMonthNavigation
						calendarClassName="bg-dark-gray"
					/>
				</section>
				<section className="flex flex-col gap-4 w-full">
					<h2 className="text-2xl font-bold">Available times</h2>
					<div className="flex flex-col gap-4">
						<ul className="flex gap-4 min-h-[2.75rem]">
							<li className="border border-fire-sunset flex items-center rounded-lg bg-fire-sunset/25 px-4">10:00 AM</li>
							<li className="border border-fire-sunset/25 flex items-center rounded-lg  px-4">11:30 AM</li>
							<li className="border border-fire-sunset/25 flex items-center rounded-lg  px-4">1:00 PM</li>
						</ul>
						<p className="text-soft-white/50 text-sm">You have selected {startDate?.toLocaleDateString()} at 10:00 AM</p>
					</div>
				</section>
			</main>
		</>
	);
};

const Navigation = () => {
	return (
		<nav className="min-h-[4.5rem] flex justify-between items-center py-4 px-8 text-white w-full">
			<a href="/" className="flex items-center gap-2">
				{/* <img src="/logo.png" alt="Logo" className="logo" /> */}
				<span className="font-inter font-bold tracking-wider">TattCentral</span>
			</a>{" "}
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
			</ul>
		</nav>
	);
};
