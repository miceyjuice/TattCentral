import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Clock, User, AlertTriangle, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import {
	useAppointmentForCancel,
	useCancelAppointmentByToken,
	type CancelAppointmentError,
} from "@/features/appointments";

/**
 * Maps error codes to user-friendly messages
 */
function getErrorMessage(error: CancelAppointmentError | string): string {
	switch (error) {
		case "NOT_FOUND":
		case "INVALID_TOKEN":
			return "This cancellation link is invalid or has expired.";
		case "ALREADY_CANCELLED":
			return "This appointment has already been cancelled.";
		case "ALREADY_COMPLETED":
			return "This appointment has already taken place and cannot be cancelled.";
		case "TOO_LATE":
			return "Appointments cannot be cancelled within 24 hours of the scheduled time. Please contact us directly.";
		default:
			return "An unexpected error occurred. Please try again or contact us.";
	}
}

/**
 * Loading state component
 */
function LoadingState() {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center">
			<Loader2 className="h-8 w-8 animate-spin text-white/60" aria-hidden="true" />
			<p className="mt-4 text-white/60" role="status">
				Loading appointment details...
			</p>
		</div>
	);
}

/**
 * Error state component
 */
function ErrorState({ error }: { error: string }) {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center text-center">
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
				<XCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
			</div>
			<h1 className="text-2xl font-bold text-white">Unable to Cancel</h1>
			<p className="mt-2 max-w-md text-white/60">{getErrorMessage(error)}</p>
			<Button className="mt-6" variant="outline" onClick={() => navigate("/booking")}>
				Book a New Appointment
			</Button>
		</div>
	);
}

/**
 * Success state after cancellation
 */
function SuccessState() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center text-center">
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
				<CheckCircle2 className="h-8 w-8 text-green-500" aria-hidden="true" />
			</div>
			<h1 className="text-2xl font-bold text-white">Appointment Cancelled</h1>
			<p className="mt-2 max-w-md text-white/60">
				Your appointment has been successfully cancelled. You will receive a confirmation email shortly.
			</p>
			<Button className="mt-6" onClick={() => navigate("/booking")}>
				Book Another Appointment
			</Button>
		</div>
	);
}

/**
 * Cancel appointment page component
 * Allows clients to cancel their appointments via a secure link
 */
export function CancelAppointmentPage() {
	const { appointmentId } = useParams<{ appointmentId: string }>();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? "";

	const {
		data: appointment,
		isLoading,
		error: fetchError,
	} = useAppointmentForCancel(appointmentId ?? "", token);

	const cancelMutation = useCancelAppointmentByToken(appointmentId ?? "", token);

	// Show error if no appointmentId or token
	if (!appointmentId || !token) {
		return (
			<div className="min-h-screen bg-[#0a0a0a]">
				<Navigation />
				<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
					<ErrorState error="INVALID_TOKEN" />
				</main>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#0a0a0a]">
				<Navigation />
				<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
					<LoadingState />
				</main>
			</div>
		);
	}

	// Fetch error state
	if (fetchError) {
		return (
			<div className="min-h-screen bg-[#0a0a0a]">
				<Navigation />
				<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
					<ErrorState error={fetchError.message} />
				</main>
			</div>
		);
	}

	// No appointment data
	if (!appointment) {
		return (
			<div className="min-h-screen bg-[#0a0a0a]">
				<Navigation />
				<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
					<ErrorState error="NOT_FOUND" />
				</main>
			</div>
		);
	}

	// Already cancelled - show message
	if (appointment.status === "cancelled") {
		return (
			<div className="min-h-screen bg-[#0a0a0a]">
				<Navigation />
				<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
					<ErrorState error="ALREADY_CANCELLED" />
				</main>
			</div>
		);
	}

	// Cancellation successful
	if (cancelMutation.isSuccess) {
		return (
			<div className="min-h-screen bg-[#0a0a0a]">
				<Navigation />
				<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
					<SuccessState />
				</main>
			</div>
		);
	}

	// Calculate duration
	const durationMinutes = Math.round(
		(appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000,
	);

	// Main cancellation form
	return (
		<div className="min-h-screen bg-[#0a0a0a]">
			<Navigation />

			<main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
						<AlertTriangle className="h-8 w-8 text-yellow-500" aria-hidden="true" />
					</div>
					<h1 className="text-3xl font-bold text-white">Cancel Appointment</h1>
					<p className="mt-2 text-white/60">Are you sure you want to cancel this appointment?</p>
				</div>

				{/* Appointment Details Card */}
				<div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
					<h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/40">
						Appointment Details
					</h2>

					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
								<Calendar className="h-5 w-5 text-white/60" aria-hidden="true" />
							</div>
							<div>
								<p className="text-sm text-white/60">Date</p>
								<p className="font-medium text-white">
									{format(appointment.startTime, "EEEE, MMMM d, yyyy")}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
								<Clock className="h-5 w-5 text-white/60" aria-hidden="true" />
							</div>
							<div>
								<p className="text-sm text-white/60">Time</p>
								<p className="font-medium text-white">
									{format(appointment.startTime, "h:mm a")} ({durationMinutes} min)
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
								<User className="h-5 w-5 text-white/60" aria-hidden="true" />
							</div>
							<div>
								<p className="text-sm text-white/60">Artist</p>
								<p className="font-medium text-white">{appointment.artistName}</p>
							</div>
						</div>

						<div className="border-t border-white/10 pt-4">
							<p className="text-sm text-white/60">Service</p>
							<p className="font-medium text-white">{appointment.type}</p>
						</div>
					</div>
				</div>

				{/* Warning Notice */}
				<div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
					<div className="flex items-start gap-3">
						<AlertTriangle className="h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
						<div>
							<p className="font-medium text-red-400">This action cannot be undone</p>
							<p className="mt-1 text-sm text-red-400/80">
								If you cancel, you will need to book a new appointment. Cancellations must be made
								at least 24 hours before the scheduled time.
							</p>
						</div>
					</div>
				</div>

				{/* Mutation Error */}
				{cancelMutation.error && (
					<div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
						<p className="text-red-400">{getErrorMessage(cancelMutation.error.message)}</p>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button
						variant="destructive"
						size="lg"
						className="w-full sm:w-auto"
						onClick={() => cancelMutation.mutate()}
						disabled={cancelMutation.isPending}
						aria-busy={cancelMutation.isPending}
					>
						{cancelMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
								Cancelling...
							</>
						) : (
							"Cancel My Appointment"
						)}
					</Button>

					<Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
						<a href="/">Keep My Appointment</a>
					</Button>
				</div>
			</main>
		</div>
	);
}
