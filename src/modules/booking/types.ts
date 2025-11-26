export type ServiceDuration = 30 | 60 | 120 | 180 | 240;

export interface ServiceOption {
	id: string;
	label: string;
	description: string;
	durationMinutes: ServiceDuration;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
	{
		id: "consultation",
		label: "Consultation",
		description: "First time meeting to discuss ideas (30 min)",
		durationMinutes: 30,
	},
	{
		id: "small",
		label: "Small Tattoo",
		description: "Simple design, approx 5-10cm (1 hour)",
		durationMinutes: 60,
	},
	{
		id: "medium",
		label: "Medium Tattoo",
		description: "More detailed, palm size (2 hours)",
		durationMinutes: 120,
	},
	{
		id: "large",
		label: "Large Tattoo",
		description: "Complex design, hand size or larger (3 hours)",
		durationMinutes: 180,
	},
	{
		id: "extra-large",
		label: "Extra Large / Session",
		description: "Very complex or half-day session (4 hours)",
		durationMinutes: 240,
	},
];

export type BookingStep = "service" | "artist" | "datetime" | "details";
