import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookingForm, type BookingFormData } from "../components/BookingForm";
import { DateSelection } from "../components/DateSelection";
import { TimeSlotPicker } from "../components/TimeSlotPicker";
import { ServiceSelection } from "../components/ServiceSelection";
import { ArtistSelection } from "../components/ArtistSelection";
import { BookingStepper } from "../components/BookingStepper";
import { BookingSummary } from "../components/BookingSummary";
import { type ServiceOption, type BookingStep } from "../types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAvailability } from "../hooks/useAvailability";
import { useArtists } from "../hooks/useArtists";
import { createAppointment } from "@/features/appointments/api/createAppointment";
import { assignArtist } from "../utils/assignArtist";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { addMinutes, setHours, setMinutes } from "date-fns";
import { Navigation } from "@/components/Navigation";

export const BookingRoute = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data: artists } = useArtists();
	const [step, setStep] = useState<BookingStep>("service");
	const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
	const [selectedArtistId, setSelectedArtistId] = useState<string | null | undefined>(undefined);
	const [startDate, setStartDate] = useState<Date | null>(new Date());
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { availableTimes, isLoading: isLoadingAvailability } = useAvailability(
		startDate || undefined,
		selectedService?.durationMinutes || 60,
		selectedArtistId || null,
	);

	const handleSelectService = (service: ServiceOption) => {
		setSelectedService(service);
	};

	const handleSelectArtist = (artistId: string | null) => {
		setSelectedArtistId(artistId);
	};

	const handleSelectDate = (date: Date | null) => {
		if (date) {
			setStartDate(date);
			setSelectedTime(null); // Reset time when date changes
		}
	};

	const handleSelectTime = (time: string) => {
		setSelectedTime(time);
	};

	const handleBack = () => {
		switch (step) {
			case "artist":
				setStep("service");
				break;
			case "datetime":
				setStep("artist");
				break;
			case "details":
				setStep("datetime");
				break;
			default:
				break;
		}
	};

	const handleNext = () => {
		switch (step) {
			case "service":
				setStep("artist");
				break;
			case "artist":
				setStep("datetime");
				break;
			case "datetime":
				setStep("details");
				break;
		}
	};

	const canGoNext = () => {
		switch (step) {
			case "service":
				return !!selectedService;
			case "artist":
				return selectedArtistId !== undefined;
			case "datetime":
				return !!startDate && !!selectedTime;
			default:
				return false;
		}
	};

	const getArtistName = () => {
		if (selectedArtistId === undefined) return "Not selected";
		if (selectedArtistId === null) return "Any artist";
		const artist = artists?.find((a) => a.id === selectedArtistId);
		return artist ? `${artist.firstName} ${artist.lastName}` : "Unknown artist";
	};

	const onSubmit = async (data: BookingFormData) => {
		if (!selectedService || !startDate || !selectedTime) return;

		setIsSubmitting(true);
		try {
			// Parse time string (e.g., "14:30")
			const [hours, minutes] = selectedTime.split(":").map(Number);
			const startDateTime = setMinutes(setHours(startDate, hours), minutes);
			const endDateTime = addMinutes(startDateTime, selectedService.durationMinutes);

			let finalArtistId = selectedArtistId;
			let finalArtistName = "";

			if (finalArtistId) {
				const artist = artists?.find((a) => a.id === finalArtistId);
				finalArtistName = artist ? `${artist.firstName} ${artist.lastName}` : "Unknown Artist";
			} else {
				// Assign an artist if "Any Artist" was selected
				if (!artists) throw new Error("No artists loaded");
				const assigned = await assignArtist(startDateTime, endDateTime, artists);
				if (!assigned) {
					toast.error("Sorry, the selected slot is no longer available.");
					setIsSubmitting(false);
					return;
				}
				finalArtistId = assigned.id;
				finalArtistName = `${assigned.firstName} ${assigned.lastName}`;
			}

			await createAppointment({
				artistId: finalArtistId!,
				artistName: finalArtistName,
				clientId: user?.uid || "guest", // Use guest ID if not logged in
				clientName: data.name,
				type: selectedService.label,
				startTime: startDateTime,
				endTime: endDateTime,
				status: "pending", // Default to pending
				imageUrl:
					"https://images.unsplash.com/photo-1590246295016-4c67e7000d77?q=80&w=2070&auto=format&fit=crop", // Placeholder
			});

			toast.success("Appointment request sent!");
			navigate("/"); // Redirect to home or success page
		} catch (error) {
			console.error("Booking error:", error);
			toast.error("Failed to book appointment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Navigation showBookNow={false} />
			<main className="mx-auto mt-24 flex w-full max-w-[1440px] flex-col gap-10 px-6 lg:px-10">
				<div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-12">
					{/* Left Column: Main Content */}
					<div className="flex-1">
						{/* Top Stepper */}
						<div className="mb-20 w-full">
							<BookingStepper currentStep={step} />
						</div>
						{/* Header */}
						<div className="mb-6 flex items-center gap-4">
							<h1 className="text-soft-white text-3xl font-bold">
								{step === "service" && "Select service"}
								{step === "artist" && "Select artist"}
								{step === "datetime" && "Select date & time"}
								{step === "details" && "Your details"}
							</h1>
						</div>

						{/* Step 1: Service Selection */}
						{step === "service" && (
							<ServiceSelection
								selectedServiceId={selectedService?.id || null}
								onSelect={handleSelectService}
							/>
						)}

						{/* Step 2: Artist Selection */}
						{step === "artist" && (
							<ArtistSelection selectedArtistId={selectedArtistId} onSelect={handleSelectArtist} />
						)}

						{/* Step 3: Date & Time */}
						{step === "datetime" && (
							<div className="flex flex-col gap-8">
								<div className="mx-auto">
									<DateSelection selectedDate={startDate} onSelect={handleSelectDate} />
								</div>
								<div className="flex flex-col gap-4">
									<h3 className="text-soft-white text-xl font-semibold">Available times</h3>
									{isLoadingAvailability ? (
										<p className="text-soft-white/60">Loading available times...</p>
									) : (
										<TimeSlotPicker
											availableTimes={availableTimes}
											selectedTime={selectedTime}
											onSelectTime={handleSelectTime}
											selectedDate={startDate}
										/>
									)}
								</div>
							</div>
						)}

						{/* Step 4: Details Form */}
						{step === "details" && (
							<div className="rounded-2xl border border-white/10 bg-white/5 p-6">
								<BookingForm
									onSubmit={onSubmit}
									isSubmitting={isSubmitting}
									isConsultation={selectedService?.id === "consultation"}
								/>
							</div>
						)}

						{/* Navigation Buttons */}
						<div className="mt-6 flex gap-4">
							<Button onClick={handleBack} disabled={step === "service"} className="">
								<ChevronLeft className="mr-2 h-4 w-4" />
								Previous
							</Button>

							{step !== "details" && (
								<Button onClick={handleNext} disabled={!canGoNext()} className="">
									Next
									<ChevronRight className="ml-2 h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* Right Column: Summary Panel */}
					<div className="w-full lg:w-[380px]">
						<BookingSummary
							selectedService={selectedService}
							artistName={getArtistName()}
							date={startDate}
							time={selectedTime}
						/>
					</div>
				</div>
			</main>
		</>
	);
};
