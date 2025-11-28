import { type ServiceOption } from "../types";
import { Calendar, User, Scissors } from "lucide-react";

interface BookingSummaryProps {
	selectedService: ServiceOption | null;
	artistName: string;
	date: Date | null;
	time: string | null;
}

export const BookingSummary = ({ selectedService, artistName, date, time }: BookingSummaryProps) => {
	return (
		<div className="sticky top-6 flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
			<h3 className="text-soft-white text-xl font-bold">Your Booking</h3>

			<div className="flex flex-col gap-4">
				{/* Service */}
				<div className="flex items-start gap-3">
					<div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
						<Scissors className="h-4 w-4" />
					</div>
					<div>
						<p className="text-soft-white/60 text-xs tracking-wider uppercase">Service</p>
						<p className="text-soft-white font-medium">
							{selectedService ? (
								selectedService.label
							) : (
								<span className="text-white/30">Not selected</span>
							)}
						</p>
						{selectedService && (
							<p className="text-soft-white/40 text-xs">{selectedService.durationMinutes} min</p>
						)}
					</div>
				</div>

				{/* Artist */}
				<div className="flex items-start gap-3">
					<div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
						<User className="h-4 w-4" />
					</div>
					<div>
						<p className="text-soft-white/60 text-xs tracking-wider uppercase">Artist</p>
						<p className="text-soft-white font-medium">
							{!selectedService ? <span className="text-white/30">Not selected</span> : artistName}
						</p>
					</div>
				</div>

				{/* Date & Time */}
				<div className="flex items-start gap-3">
					<div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
						<Calendar className="h-4 w-4" />
					</div>
					<div>
						<p className="text-soft-white/60 text-xs tracking-wider uppercase">Date & Time</p>
						<p className="text-soft-white font-medium">
							{date && time ? (
								<>
									{date.toLocaleDateString()}
									<br />
									<span className="text-fire-sunset">{time}</span>
								</>
							) : (
								<span className="text-white/30">Not selected</span>
							)}
						</p>
					</div>
				</div>
			</div>

			{/* Total Price or Note */}
			<div className="mt-4 border-t border-white/10 pt-4">
				<p className="text-soft-white/40 text-xs italic">
					* A deposit may be required to confirm your booking.
				</p>
			</div>
		</div>
	);
};
