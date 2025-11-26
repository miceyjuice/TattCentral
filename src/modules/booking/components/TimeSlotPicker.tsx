import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
	availableTimes: string[];
	selectedTime: string | null;
	onSelectTime: (time: string) => void;
	selectedDate: Date | null;
}

export const TimeSlotPicker = ({ availableTimes, selectedTime, onSelectTime, selectedDate }: TimeSlotPickerProps) => {
	return (
		<div className="flex flex-col gap-4">
			<ul className="flex min-h-[2.75rem] flex-wrap gap-4">
				{availableTimes.map((time) => (
					<li key={time}>
						<button
							type="button"
							className={cn(
								"flex h-full items-center rounded-lg border px-4 py-2 transition-colors",
								selectedTime === time
									? "border-fire-sunset bg-fire-sunset/25 text-soft-white"
									: "border-fire-sunset/25 text-soft-white/75 hover:bg-fire-sunset/10",
							)}
							onClick={() => onSelectTime(time)}
						>
							{time}
						</button>
					</li>
				))}
			</ul>
			<div className="min-h-5">
				{selectedDate && selectedTime && (
					<p className="text-soft-white/50 text-sm">
						You have selected <b>{selectedDate.toLocaleDateString()} </b>
						at
						<b> {selectedTime}</b>.
					</p>
				)}
			</div>
		</div>
	);
};
