import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar, Clock, User, Mail, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

interface BookingConfirmationState {
	appointmentId: string;
	clientName: string;
	clientEmail: string;
	artistName: string;
	serviceLabel: string;
	startTime: string; // ISO string
	endTime: string; // ISO string
}

const STUDIO_NAME = "TattCentral";
const STUDIO_LOCATION = "TattCentral Studio";
// Studio timezone - appointments are stored in this timezone
const STUDIO_TIMEZONE = "Europe/Warsaw";

/**
 * Generates the event title for calendar entries
 */
function getEventTitle(serviceLabel: string): string {
	return `${serviceLabel} - ${STUDIO_NAME}`;
}

/**
 * Generates the event description for calendar entries
 */
function getEventDescription(artistName: string, serviceLabel: string): string {
	return `Artist: ${artistName}\nService: ${serviceLabel}\n\nBooked via ${STUDIO_NAME}`;
}

/**
 * Generates a Google Calendar URL with pre-filled event details
 * Google Calendar accepts timezone parameter separately
 */
function generateGoogleCalendarUrl(data: BookingConfirmationState): string {
	const startTimeStr = formatInTimeZone(data.startTime, STUDIO_TIMEZONE, "yyyyMMdd'T'HHmmss");
	const endTimeStr = formatInTimeZone(data.endTime, STUDIO_TIMEZONE, "yyyyMMdd'T'HHmmss");

	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: getEventTitle(data.serviceLabel),
		dates: `${startTimeStr}/${endTimeStr}`,
		details: getEventDescription(data.artistName, data.serviceLabel),
		location: STUDIO_LOCATION,
		ctz: STUDIO_TIMEZONE,
	});

	return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an Outlook Calendar URL with pre-filled event details
 * Outlook uses ISO format with timezone info
 */
function generateOutlookCalendarUrl(data: BookingConfirmationState): string {
	// Outlook expects ISO format; we include timezone offset
	const startTimeStr = formatInTimeZone(data.startTime, STUDIO_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
	const endTimeStr = formatInTimeZone(data.endTime, STUDIO_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");

	const params = new URLSearchParams({
		path: "/calendar/action/compose",
		rru: "addevent",
		subject: getEventTitle(data.serviceLabel),
		startdt: startTimeStr,
		enddt: endTimeStr,
		body: getEventDescription(data.artistName, data.serviceLabel),
		location: STUDIO_LOCATION,
	});

	return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates an .ics file content for Apple Calendar and other calendar apps
 * ICS format supports VTIMEZONE component or TZID parameter for timezone info
 */
function generateIcsContent(data: BookingConfirmationState): string {
	const startTimeStr = formatInTimeZone(data.startTime, STUDIO_TIMEZONE, "yyyyMMdd'T'HHmmss");
	const endTimeStr = formatInTimeZone(data.endTime, STUDIO_TIMEZONE, "yyyyMMdd'T'HHmmss");
	const now = formatInTimeZone(new Date(), STUDIO_TIMEZONE, "yyyyMMdd'T'HHmmss");
	// ICS format requires escaped newlines
	const icsDescription = getEventDescription(data.artistName, data.serviceLabel).replace(/\n/g, "\\n");

	// ICS format requires no leading whitespace on lines
	// Using TZID parameter to specify timezone for start/end times
	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		`PRODID:-//${STUDIO_NAME}//Booking//EN`,
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${data.appointmentId}@tattcentral.com`,
		`DTSTAMP:${now}`,
		`DTSTART;TZID=${STUDIO_TIMEZONE}:${startTimeStr}`,
		`DTEND;TZID=${STUDIO_TIMEZONE}:${endTimeStr}`,
		`SUMMARY:${getEventTitle(data.serviceLabel)}`,
		`DESCRIPTION:${icsDescription}`,
		`LOCATION:${STUDIO_LOCATION}`,
		"STATUS:TENTATIVE",
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
}

function downloadIcsFile(data: BookingConfirmationState) {
	const icsContent = generateIcsContent(data);
	const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `tattcentral-appointment-${format(new Date(data.startTime), "yyyy-MM-dd")}.ics`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function BookingConfirmation() {
	const location = useLocation();
	const navigate = useNavigate();
	const state = location.state as BookingConfirmationState | null;

	// Redirect if no state (direct navigation to this page)
	if (!state) {
		return <Navigate to="/booking" replace />;
	}

	// Parse ISO strings back to Date objects
	const startTime = new Date(state.startTime);
	const endTime = new Date(state.endTime);

	const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

	return (
		<div className="min-h-screen bg-[#0a0a0a]">
			<Navigation />

			<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
				{/* Success Header */}
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
						<CheckCircle aria-hidden="true" className="ml-[1px] h-8 w-8 text-green-500" />
					</div>
					<h1 className="text-3xl font-bold text-white">Booking Request Sent!</h1>
					<p className="mt-2 text-white/60">
						Your appointment is pending approval. We'll notify you once it's confirmed.
					</p>
				</div>

				{/* Pending Status Notice */}
				<div className="mb-8 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
					<div className="flex items-start gap-3">
						<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
							<Mail aria-hidden="true" className="h-3.5 w-3.5 text-yellow-500" />
						</div>
						<div>
							<h3 className="font-medium text-yellow-200">Check your email</h3>
							<p className="mt-1 text-sm text-yellow-200/70">
								We've sent a confirmation to <span className="font-medium">{state.clientEmail}</span>.
								You'll receive another email once your appointment is approved.
							</p>
						</div>
					</div>
				</div>

				{/* Appointment Details */}
				<div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
					<h2 className="mb-4 text-sm font-medium tracking-wider text-white/40 uppercase">
						Appointment Details
					</h2>

					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<User aria-hidden="true" className="h-5 w-5 text-white/40" />
							<div>
								<p className="text-sm text-white/60">Client</p>
								<p className="text-white">{state.clientName}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<User aria-hidden="true" className="h-5 w-5 text-white/40" />
							<div>
								<p className="text-sm text-white/60">Artist</p>
								<p className="text-white">{state.artistName}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Calendar aria-hidden="true" className="h-5 w-5 text-white/40" />
							<div>
								<p className="text-sm text-white/60">Date</p>
								<p className="text-white">{format(startTime, "EEEE, d MMMM yyyy")}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Clock aria-hidden="true" className="h-5 w-5 text-white/40" />
							<div>
								<p className="text-sm text-white/60">Time</p>
								<p className="text-white">
									{format(startTime, "HH:mm")} - {format(endTime, "HH:mm")} ({durationMinutes}m)
								</p>
							</div>
						</div>

						<div className="border-t border-white/10 pt-4">
							<p className="text-sm text-white/60">Service</p>
							<p className="text-lg font-medium text-white">{state.serviceLabel}</p>
						</div>
					</div>
				</div>

				{/* Add to Calendar Section */}
				<div className="mt-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
					<h2 className="mb-4 text-sm font-medium tracking-wider text-white/40 uppercase">Add to Calendar</h2>
					<p className="mb-4 text-sm text-white/60">
						Save this appointment to your calendar so you don't forget!
					</p>

					<div className="flex flex-wrap gap-3">
						<Button
							variant="outline"
							className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
							onClick={() =>
								window.open(generateGoogleCalendarUrl(state), "_blank", "noopener,noreferrer")
							}
						>
							<ExternalLink aria-hidden="true" className="mr-2 h-4 w-4" />
							Google Calendar
						</Button>

						<Button
							variant="outline"
							className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
							onClick={() =>
								window.open(generateOutlookCalendarUrl(state), "_blank", "noopener,noreferrer")
							}
						>
							<ExternalLink aria-hidden="true" className="mr-2 h-4 w-4" />
							Outlook
						</Button>

						<Button
							variant="outline"
							className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
							onClick={() => downloadIcsFile(state)}
						>
							<ExternalLink aria-hidden="true" className="mr-2 h-4 w-4" />
							Apple Calendar (.ics)
						</Button>
					</div>
				</div>

				{/* Back to Home Button */}
				<div className="mt-8 text-center">
					<Button onClick={() => navigate("/")} className="bg-white text-black hover:bg-white/90">
						Back to Home
					</Button>
				</div>
			</main>
		</div>
	);
}
