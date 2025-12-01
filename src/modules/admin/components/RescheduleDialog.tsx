import { useState, useMemo } from "react";
import { format, addMinutes, setHours, setMinutes, parse } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useRescheduleAppointment, type AppointmentDetail } from "@/features/appointments";
import { useAvailability } from "@/modules/booking/hooks/useAvailability";
import { TimeSlotPicker } from "@/modules/booking/components/TimeSlotPicker";

interface RescheduleDialogProps {
	appointment: AppointmentDetail;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function RescheduleDialog({ appointment, open, onOpenChange, onSuccess }: RescheduleDialogProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);

	// Calculate duration from original appointment
	const durationMinutes = useMemo(() => {
		return Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000);
	}, [appointment.startTime, appointment.endTime]);

	// Fetch availability for the selected date and artist
	const { availableTimes, isLoading: isLoadingAvailability } = useAvailability(
		selectedDate,
		durationMinutes,
		appointment.artistId,
	);

	const { mutate: reschedule, isPending: isRescheduling } = useRescheduleAppointment();

	const handleDateSelect = (date: Date | undefined) => {
		setSelectedDate(date);
		setSelectedTime(null); // Reset time when date changes
	};

	const handleConfirm = () => {
		if (!selectedDate || !selectedTime) return;

		// Parse the selected time and create new start/end dates
		const [hours, minutes] = selectedTime.split(":").map(Number);
		const newStartTime = setMinutes(setHours(selectedDate, hours), minutes);
		const newEndTime = addMinutes(newStartTime, durationMinutes);

		reschedule(
			{
				appointmentId: appointment.id,
				newStartTime,
				newEndTime,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
					onSuccess?.();
					// Reset state
					setSelectedDate(undefined);
					setSelectedTime(null);
				},
			},
		);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Reset state when closing
			setSelectedDate(undefined);
			setSelectedTime(null);
		}
		onOpenChange(open);
	};

	const isConfirmDisabled = !selectedDate || !selectedTime || isRescheduling;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="border-white/10 bg-[#1a1a1a] px-6 py-8 sm:max-w-3xl">
				<DialogHeader className="mb-4">
					<DialogTitle className="text-white">Reschedule appointment</DialogTitle>
					<DialogDescription className="text-white/60">
						Select a new date and time for{" "}
						<span className="font-medium text-gray-200">{appointment.clientName}'s</span> appointment.
					</DialogDescription>
				</DialogHeader>

				{/* Current Appointment Info */}
				<div className="rounded-lg border border-white/10 bg-white/5 p-4">
					<h4 className="mb-2 text-xs font-medium tracking-wider text-white/40 uppercase">
						Current Schedule
					</h4>
					<div className="flex items-center gap-2 text-sm text-white">
						<CalendarIcon className="h-4 w-4 text-white/60" />
						<span>{format(appointment.startTime, "EEEE, d MMMM yyyy")}</span>
					</div>
					<div className="mt-1 flex items-center gap-2 text-sm text-white">
						<Clock className="h-4 w-4 text-white/60" />
						<span>
							{format(appointment.startTime, "HH:mm")} - {format(appointment.endTime, "HH:mm")} (
							{durationMinutes}m)
						</span>
					</div>
				</div>
				<div className="mt-4 flex justify-between gap-7.5">
					{/* Date Selection */}
					<div className="space-y-3">
						<h4 className="text-xs font-medium tracking-wider text-white/40 uppercase">Select New Date</h4>
						<div className="flex justify-center">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={handleDateSelect}
								disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
								className="w-xs rounded-lg border border-white/10 bg-white/5"
							/>
						</div>
					</div>

					{/* Time Selection */}
					{selectedDate && (
						<div className="space-y-3">
							<h4 className="text-xs font-medium tracking-wider text-white/40 uppercase">
								Select New Time
							</h4>
							{isLoadingAvailability ? (
								<div
									className="flex items-center justify-center py-4"
									role="status"
									aria-label="Loading available times"
								>
									<Loader2 className="h-5 w-5 animate-spin text-white/60" />
								</div>
							) : (
								<TimeSlotPicker
									availableTimes={availableTimes}
									selectedTime={selectedTime}
									onSelectTime={setSelectedTime}
									selectedDate={selectedDate}
								/>
							)}
						</div>
					)}
				</div>

				{/* New Schedule Preview */}
				{selectedDate && selectedTime && (
					<div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
						<h4 className="mb-2 text-xs font-medium tracking-wider text-green-400 uppercase">
							New Schedule
						</h4>
						<div className="flex items-center gap-2 text-sm text-white">
							<CalendarIcon className="h-4 w-4 text-green-400" />
							<span>{format(selectedDate, "EEEE, d MMMM yyyy")}</span>
						</div>
						<div className="mt-1 flex items-center gap-2 text-sm text-white">
							<Clock className="h-4 w-4 text-green-400" />
							<span>
								{selectedTime} -{" "}
								{format(
									addMinutes(parse(selectedTime, "HH:mm", selectedDate), durationMinutes),
									"HH:mm",
								)}{" "}
								({durationMinutes}m)
							</span>
						</div>
					</div>
				)}

				<DialogFooter className="mt-4 gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						className="border-white/20 bg-transparent text-white hover:bg-white/10"
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={isConfirmDisabled}
						aria-busy={isRescheduling}
						className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
					>
						{isRescheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Confirm reschedule
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
