import { format } from "date-fns";
import { Calendar, Check, CreditCard, Loader2, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppointmentDetail, useUpdateAppointmentStatus, type UpcomingAppointment } from "@/features/appointments";
import { useState } from "react";
import { RescheduleDialog } from "./RescheduleDialog";
import type { PaymentStatus } from "@/features/payments";

/**
 * Get payment badge styling based on status
 */
function getPaymentBadgeStyles(status: PaymentStatus | undefined): { bg: string; text: string; label: string } {
	switch (status) {
		case "paid":
			return { bg: "bg-green-500/20 border-green-500/50", text: "text-green-400", label: "Paid" };
		case "refunded":
			return { bg: "bg-blue-500/20 border-blue-500/50", text: "text-blue-400", label: "Refunded" };
		case "failed":
			return { bg: "bg-red-500/20 border-red-500/50", text: "text-red-400", label: "Payment Failed" };
		case "pending":
			return { bg: "bg-yellow-500/20 border-yellow-500/50", text: "text-yellow-400", label: "Payment Pending" };
		default:
			return { bg: "bg-white/10 border-white/20", text: "text-white/60", label: "No Deposit" };
	}
}

interface AppointmentDetailSheetProps {
	appointment: UpcomingAppointment | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type PendingAction = "approve" | "decline" | "cancel" | null;

export function AppointmentDetailSheet({ appointment, open, onOpenChange }: AppointmentDetailSheetProps) {
	const { data: detail, isLoading } = useAppointmentDetail(open ? (appointment?.id ?? null) : null);
	const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatus();
	const [pendingAction, setPendingAction] = useState<PendingAction>(null);
	const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

	const handleUpdateStatus = (action: PendingAction, status: "upcoming" | "cancelled", successMessage: string) => {
		if (!appointment) return;
		setPendingAction(action);
		updateStatus(
			{ appointmentId: appointment.id, status, successMessage },
			{
				onSettled: () => {
					setPendingAction(null);
					onOpenChange(false);
				},
			},
		);
	};

	const formatDateTime = (start: Date, end: Date) => {
		const dateStr = format(start, "d MMMM yyyy");
		const startTime = format(start, "HH:mm");
		const endTime = format(end, "HH:mm");
		const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
		return `${dateStr}, ${startTime} - ${endTime} (${durationMinutes}m)`;
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="w-full overflow-y-auto border-white/10 bg-[#121212] px-6 py-8 sm:max-w-lg"
			>
				<SheetHeader className="p-0">
					<SheetTitle className="text-xl text-white">Appointment details</SheetTitle>
					<SheetDescription className="sr-only">
						View and manage appointment information including client details, schedule, and reference
						images.
					</SheetDescription>
				</SheetHeader>

				{isLoading ? (
					<div
						className="flex h-64 items-center justify-center"
						role="status"
						aria-label="Loading appointment details"
					>
						<Loader2 className="h-8 w-8 animate-spin text-white/60" />
					</div>
				) : detail ? (
					<div className="flex flex-col gap-6 pb-6">
						{/* Status Badges */}
						<div className="flex flex-wrap gap-2">
							{detail.status === "pending" && (
								<div className="flex rounded-full border border-white/10 bg-yellow-500/90 px-3 py-1">
									<span className="text-[10px] font-medium text-black uppercase">
										Pending Approval
									</span>
								</div>
							)}
							<div className="border-fire-sunset bg-fire-sunset/20 flex rounded-full border px-3 py-1">
								<span className="text-[10px] font-medium text-white uppercase">{detail.type}</span>
							</div>
							{/* Payment Status Badge */}
							{(detail.paymentStatus || detail.depositAmount) && (
								<div
									className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${getPaymentBadgeStyles(detail.paymentStatus).bg}`}
								>
									<CreditCard
										className={`h-3 w-3 ${getPaymentBadgeStyles(detail.paymentStatus).text}`}
									/>
									<span
										className={`text-[10px] font-medium uppercase ${getPaymentBadgeStyles(detail.paymentStatus).text}`}
									>
										{getPaymentBadgeStyles(detail.paymentStatus).label}
										{detail.depositAmount ? ` (${detail.depositAmount} PLN)` : ""}
									</span>
								</div>
							)}
						</div>

						{/* Client Name & DateTime */}
						<div className="flex flex-col gap-1">
							<h2 className="text-2xl font-semibold text-white">{detail.clientName}</h2>
							<div className="flex items-center gap-2 text-sm text-white/60">
								<Calendar className="h-4 w-4" />
								<span className="mt-0.5">{formatDateTime(detail.startTime, detail.endTime)}</span>
							</div>
						</div>

						{/* Contact Info */}
						{(detail.clientEmail || detail.clientPhone) && (
							<div className="space-y-2">
								<h3 className="text-xs font-medium tracking-wider text-white/40 uppercase">
									Contact Info
								</h3>
								<div className="space-y-2">
									{detail.clientEmail && (
										<a
											href={`mailto:${detail.clientEmail}`}
											className="flex items-center gap-3 text-sm text-green-400 hover:underline"
										>
											<Mail className="h-4 w-4" />
											{detail.clientEmail}
										</a>
									)}
									{detail.clientPhone && (
										<a
											href={`tel:${detail.clientPhone}`}
											className="flex items-center gap-3 text-sm text-white"
										>
											<Phone className="h-4 w-4" />
											{detail.clientPhone}
										</a>
									)}
								</div>
							</div>
						)}

						{/* Description */}
						{detail.description && (
							<div className="space-y-2">
								<h3 className="text-xs font-medium tracking-wider text-white/40 uppercase">
									Client Notes
								</h3>
								<blockquote className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/80 italic">
									"{detail.description}"
								</blockquote>
							</div>
						)}

						{/* Reference Images */}
						{detail.referenceImageUrls && detail.referenceImageUrls.length > 0 && (
							<div className="space-y-3">
								<h3 className="text-xs font-medium tracking-wider text-white/40 uppercase">
									Reference Images ({detail.referenceImageUrls.length})
								</h3>
								<div className="grid grid-cols-2 gap-3">
									{detail.referenceImageUrls.map((url, index) => (
										<a
											key={url}
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5"
										>
											<img
												src={url}
												alt={`Reference ${index + 1}`}
												className="h-full w-full object-cover transition-transform group-hover:scale-105"
											/>
											<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
												<span className="text-xs font-medium text-white">View Full</span>
											</div>
										</a>
									))}
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-6">
							{detail.status === "pending" ? (
								<>
									<Button
										className="w-full rounded-full bg-green-600 py-6 text-sm font-medium text-white transition hover:bg-green-700"
										type="button"
										onClick={() =>
											handleUpdateStatus("approve", "upcoming", "Appointment approved")
										}
										disabled={isUpdating}
									>
										{pendingAction === "approve" ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Check className="mr-2 h-4 w-4" />
										)}
										Approve Appointment
									</Button>
									<Button
										className="w-full rounded-full border border-white/20 bg-transparent py-6 text-sm font-medium text-white transition hover:bg-white/10"
										type="button"
										variant="outline"
										onClick={() =>
											handleUpdateStatus("decline", "cancelled", "Appointment declined")
										}
										disabled={isUpdating}
									>
										{pendingAction === "decline" ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<X className="mr-2 h-4 w-4" />
										)}
										Decline
									</Button>
								</>
							) : (
								<>
									<Button
										className="w-full rounded-full border border-transparent bg-[#2a1f1f] py-6 text-sm font-medium text-white transition hover:bg-[#3a2f2f]"
										type="button"
										onClick={() => setRescheduleDialogOpen(true)}
									>
										Reschedule
									</Button>
									<Button
										className="w-full rounded-full border border-white/20 bg-transparent py-6 text-sm font-medium text-white transition hover:bg-white/10"
										type="button"
										variant="outline"
										onClick={() =>
											handleUpdateStatus("cancel", "cancelled", "Appointment cancelled")
										}
										disabled={isUpdating}
									>
										{pendingAction === "cancel" && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Cancel Appointment
									</Button>
								</>
							)}
						</div>
					</div>
				) : (
					<div className="flex h-64 items-center justify-center text-white/60">Appointment not found</div>
				)}
			</SheetContent>

			{/* Reschedule Dialog */}
			{detail && (
				<RescheduleDialog
					appointment={detail}
					open={rescheduleDialogOpen}
					onOpenChange={setRescheduleDialogOpen}
					onSuccess={() => onOpenChange(false)}
				/>
			)}
		</Sheet>
	);
}
