import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUpdateAppointmentStatus, type UpcomingAppointment } from "@/features/appointments";
import { cn } from "@/lib/utils";
import { Eye, Loader2 } from "lucide-react";
import { useState } from "react";

interface AppointmentCardProps {
	appointment: UpcomingAppointment;
	onViewDetails?: () => void;
}

type PendingAction = "approve" | "decline" | "cancel" | null;

export function AppointmentCard({ appointment, onViewDetails }: AppointmentCardProps) {
	const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatus();
	const [pendingAction, setPendingAction] = useState<PendingAction>(null);

	const handleUpdateStatus = (action: PendingAction, status: "upcoming" | "cancelled", successMessage: string) => {
		setPendingAction(action);
		updateStatus(
			{ appointmentId: appointment.id, status, successMessage },
			{ onSettled: () => setPendingAction(null) },
		);
	};

	return (
		<article
			className={cn(
				"rounded-4xl border border-white/10 bg-[#1f1818] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]",
				isUpdating && "opacity-75",
			)}
		>
			<div className="space-y-5 px-8 py-6">
				<div className="space-y-4">
					<div className="flex flex-col gap-1">
						<div className="mb-1 flex gap-2">
							{appointment.status === "pending" && (
								<div className="flex rounded-full border border-white/10 bg-yellow-500/90 px-3 py-1 backdrop-blur-sm">
									<span className="text-[10px] font-medium text-black uppercase">
										Pending Approval
									</span>
								</div>
							)}
							<div className="border-fire-sunset bg-fire-sunset/20 flex rounded-full border px-3 py-1 backdrop-blur-sm">
								<span className="text-[10px] font-medium text-white uppercase">{appointment.type}</span>
							</div>
						</div>
						<h2 className="text-xl font-semibold">{appointment.title}</h2>
						<p className="text-sm text-white/60">{appointment.dateRange}</p>
					</div>
				</div>
				<div className="flex gap-3">
					{appointment.status === "pending" ? (
						<>
							<Button
								variant="default"
								className="rounded-full border border-transparent bg-gray-100 px-6 py-5 text-sm font-medium text-black transition hover:bg-gray-100/80"
								type="button"
								onClick={() => handleUpdateStatus("approve", "upcoming", "Appointment approved")}
								disabled={isUpdating}
							>
								{pendingAction === "approve" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Approve
							</Button>
							<Button
								className="rounded-full border border-white/20 bg-transparent px-6 py-5 text-sm font-medium text-white transition hover:bg-white/10"
								type="button"
								variant="outline"
								onClick={() => handleUpdateStatus("decline", "cancelled", "Appointment declined")}
								disabled={isUpdating}
							>
								{pendingAction === "decline" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Decline
							</Button>
							<Button
								className="rounded-full border border-white/20 bg-transparent px-6 py-5 text-sm font-medium text-white transition hover:bg-white/10"
								type="button"
								variant="ghost"
								onClick={onViewDetails}
								aria-label="View appointment details"
							>
								<Eye className="h-4 w-4" aria-hidden="true" />
								<span className="sr-only">View Details</span>
							</Button>
						</>
					) : (
						<>
							{/* TODO: Implement reschedule functionality - SCRUM-XX */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="rounded-full border border-transparent bg-gray-100 px-6 py-5 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-50"
										type="button"
										disabled
									>
										Reschedule
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Coming soon</p>
								</TooltipContent>
							</Tooltip>
							<Button
								className="rounded-full border border-white/20 bg-transparent px-6 py-5 text-sm font-medium text-white transition hover:bg-white/10"
								type="button"
								variant="outline"
								onClick={() => handleUpdateStatus("cancel", "cancelled", "Appointment cancelled")}
								disabled={isUpdating}
							>
								{pendingAction === "cancel" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Cancel
							</Button>
							<Button
								className="rounded-full border border-white/20 bg-transparent px-6 py-5 text-sm font-medium text-white transition hover:bg-white/10"
								type="button"
								variant="ghost"
								onClick={onViewDetails}
								aria-label="View appointment details"
							>
								<Eye className="h-4 w-4" aria-hidden="true" />
								<span className="sr-only">View Details</span>
							</Button>
						</>
					)}
				</div>
			</div>
		</article>
	);
}
