import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
	clientName: z.string().min(2, {
		message: "Client name must be at least 2 characters.",
	}),
	date: z.date({
		required_error: "A date of appointment is required.",
	}),
	time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: "Please enter a valid time (HH:MM).",
	}),
});

export function CreateAppointmentDialog() {
	const [open, setOpen] = useState(false);
	const { user, userProfile } = useAuth();
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			clientName: "",
			time: "12:00",
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!user || !userProfile) return;

		try {
			// Combine date and time
			const [hours, minutes] = values.time.split(":").map(Number);
			const startTime = new Date(values.date);
			startTime.setHours(hours, minutes);

			const endTime = new Date(startTime);
			endTime.setHours(hours + 1, minutes); // Default 1 hour duration

			await addDoc(collection(db, "appointments"), {
				artistId: user.uid,
				artistName: `${userProfile.firstName} ${userProfile.lastName}`,
				clientId: "manual-entry", // Placeholder for manual entries
				clientName: values.clientName,
				startTime: Timestamp.fromDate(startTime),
				endTime: Timestamp.fromDate(endTime),
				status: "upcoming",
				imageUrl:
					"https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=60", // Default placeholder
				rating: 0,
			});

			toast("Appointment created", {
				description: `Booked for ${values.clientName} on ${format(startTime, "PPP HH:mm")}`,
			});

			setOpen(false);
			form.reset();
			void queryClient.invalidateQueries({ queryKey: ["appointments"] });
		} catch (error) {
			console.error(error);
			toast("Error", {
				description: "Failed to create appointment. Please try again.",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="gap-2 rounded-full bg-white text-black hover:bg-white/90">
					<Plus className="h-4 w-4" />
					New Appointment
				</Button>
			</DialogTrigger>
			<DialogContent className="border-white/10 bg-[#1f1818] text-white sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Appointment</DialogTitle>
					<DialogDescription className="text-white/60">
						Manually add a booking to your calendar.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="clientName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Client Name</FormLabel>
									<FormControl>
										<Input
											placeholder="John Doe"
											{...field}
											className="border-white/10 bg-[#2a1f1f] text-white"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="date"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={`w-full border-white/10 bg-[#2a1f1f] pl-3 text-left font-normal text-white hover:bg-[#332222] hover:text-white ${
															!field.value && "text-muted-foreground"
														}`}
													>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto border-white/10 bg-[#1f1818] p-0 text-white"
												align="start"
											>
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) => date < new Date()}
													initialFocus
													className="bg-[#1f1818] text-white"
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Time</FormLabel>
										<FormControl>
											<Input
												type="time"
												{...field}
												className="border-white/10 bg-[#2a1f1f] text-white"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								className="w-full bg-white text-black hover:bg-white/90 sm:w-auto"
							>
								{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Create Booking
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
