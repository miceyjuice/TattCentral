import { cn } from "@/lib/utils";
import { type BookingStep } from "../types";
import { Check } from "lucide-react";

interface BookingStepperProps {
	currentStep: BookingStep;
}

const STEPS: { id: BookingStep; label: string; number: number }[] = [
	{ id: "service", label: "Service", number: 1 },
	{ id: "artist", label: "Artist", number: 2 },
	{ id: "datetime", label: "Date & Time", number: 3 },
	{ id: "details", label: "Details", number: 4 },
];

export const BookingStepper = ({ currentStep }: BookingStepperProps) => {
	const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

	return (
		<div className="relative flex w-full items-center justify-between">
			{/* Connecting Lines Background */}
			<div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-white/10" />

			{/* Active Line Progress */}
			<div
				className="bg-fire-sunset absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500 ease-in-out"
				style={{
					width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
				}}
			/>

			{/* Steps */}
			{STEPS.map((step, index) => {
				const isCompleted = index < currentStepIndex;
				const isCurrent = index === currentStepIndex;

				return (
					<div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-[#121212] px-2">
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
								isCompleted
									? "border-fire-sunset bg-fire-sunset text-white"
									: isCurrent
										? "border-fire-sunset text-fire-sunset bg-[#121212]"
										: "border-white/20 bg-[#121212] text-white/40",
							)}
						>
							{isCompleted ? <Check className="h-4 w-4" /> : step.number}
						</div>
						<span
							className={cn(
								"absolute -bottom-8 text-xs font-medium whitespace-nowrap transition-colors duration-300",
								isCompleted || isCurrent ? "text-soft-white" : "text-white/40",
							)}
						>
							{step.label}
						</span>
					</div>
				);
			})}
		</div>
	);
};
