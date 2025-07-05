import parsePhoneNumber from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const BookingPage = () => {
	const [startDate, setStartDate] = useState<Date | null>(new Date());
	const [selectedTime, setSelectedTime] = useState<string | null>(null);

	// TODO: Replace with actual available times from the backend or a more dynamic source
	const availableTimes = ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM"];

	const zPhoneNumber = z.string().transform((value, ctx) => {
		const phoneNumber = parsePhoneNumber(value, {
			defaultCountry: "PL",
			defaultCallingCode: "+48",
		});

		if (!phoneNumber?.isValid()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Invalid phone number",
			});
			return z.NEVER;
		}

		return phoneNumber.formatInternational();
	});

	const FormSchema = z.object({
		name: z.string().min(2, {
			message: "Name must be at least 3 characters.",
		}),
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		phone: zPhoneNumber,
		tattooDescription: z.string().min(10, {
			message: "Tattoo description must be at least 10 characters.",
		}),
	});
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			tattooDescription: "",
		},
	});

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

	const onSubmit = (data: z.infer<typeof FormSchema>) => {
		alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);

		// TODO: Handle form submission, e.g., send data to an API or server
	};

	return (
		<>
			<Navigation />
			<main className="flex gap-4 justify-center max-w-7xl mx-auto w-full my-10 px-10">
				<div className="flex flex-col gap-10 w-full basis-2/3">
					<section className="px-10 mx-auto min-h-[467px]">
						<DatePicker
							selected={startDate}
							onSelect={handleSelect}
							minDate={new Date()}
							maxDate={addMonths(new Date(), 6)}
							startDate={startDate}
							inline
							showDisabledMonthNavigation
							calendarStartDay={1}
							disabledKeyboardNavigation
						/>
					</section>
					<section className="flex flex-col gap-4 w-full">
						<h2 className="text-2xl font-bold text-soft-white">Available times</h2>
						<div className="flex flex-col gap-4">
							<ul className="flex gap-4 min-h-[2.75rem]">
								{availableTimes.map((time) => (
									<li key={time}>
										<button
											className={cn(
												"border h-full flex items-center rounded-lg px-4 transition-colors",
												selectedTime === time
													? "border-fire-sunset bg-fire-sunset/25 text-soft-white"
													: "border-fire-sunset/25 text-soft-white/75 hover:bg-fire-sunset/10"
											)}
											onClick={() => setSelectedTime(time)}
										>
											{time}
										</button>
									</li>
								))}
							</ul>
							<div className="min-h-5">
								{startDate && selectedTime && (
									<p className="text-soft-white/50 text-sm">
										You have selected <b>{startDate?.toLocaleDateString()} </b>
										at
										<b> {selectedTime}</b>.
									</p>
								)}
							</div>
						</div>
					</section>
				</div>
				<section className="flex flex-col gap-6 w-full basis-1/3">
					<h2 className="text-2xl font-bold text-soft-white">Booking details</h2>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-soft-white">Name</FormLabel>
										<FormControl className="bg-gray-700/25 border-none">
											<Input className="py-6 text-soft-white" placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-soft-white">Email</FormLabel>
										<FormControl className="bg-gray-700/25 border-none">
											<Input className="py-6 text-soft-white" placeholder="john.doe@gmail.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-soft-white">Phone</FormLabel>
										<FormControl className="bg-gray-700/25 border-none">
											<Input className="py-6 text-soft-white" placeholder="111 222 333" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="tattooDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-soft-white">Tattoo description</FormLabel>
										<FormControl className="bg-gray-700/25 border-none">
											<Textarea
												className="py-3 text-soft-white max-h-40"
												placeholder="Describe your tattoo idea, size, and placement"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full bg-fire-sunset hover:bg-fire-sunset/75 text-soft-white transition-colors py-6 font-medium text-base"
							>
								Submit
							</Button>
						</form>
					</Form>
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
