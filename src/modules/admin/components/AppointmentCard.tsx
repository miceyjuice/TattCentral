import { Button } from "@/components/ui/button";
import { useUpdateAppointmentStatus, type UpcomingAppointment } from "@/features/appointments";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
	appointment: UpcomingAppointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
	const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatus();

	return (
		<article
			className={cn(
				"rounded-4xl border bg-[#1f1818] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]",
				appointment.status === "pending" ? "border-yellow-500/50" : "border-white/10",
			)}
		>
			<div className="w-full overflow-hidden rounded-t-4xl">
				{/* <img alt={appointment.title} className="h-full w-full object-cover" src={appointment.image} /> */}
			</div>
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
								className="rounded-full border border-transparent bg-green-600 px-6 py-5 text-sm font-medium text-white transition hover:bg-green-700"
								type="button"
								onClick={() =>
									updateStatus({
										appointmentId: appointment.id,
										status: "upcoming",
										successMessage: "Appointment approved",
									})
								}
								disabled={isUpdating}
							>
								Approve
							</Button>
							<Button
								className="rounded-full border border-white/20 bg-transparent px-6 py-5 text-sm font-medium text-white transition hover:bg-white/10"
								type="button"
								variant="outline"
								onClick={() =>
									updateStatus({
										appointmentId: appointment.id,
										status: "cancelled",
										successMessage: "Appointment declined",
									})
								}
								disabled={isUpdating}
							>
								Decline
							</Button>
						</>
					) : (
						<>
							<Button
								className="rounded-full border border-transparent bg-[#2a1f1f] px-6 py-5 text-sm font-medium text-white transition hover:bg-[#332222]"
								type="button"
							>
								Reschedule
							</Button>
							<Button
								className="rounded-full border border-white/20 bg-transparent px-6 py-5 text-sm font-medium text-white transition hover:bg-white/10"
								type="button"
								variant="outline"
								onClick={() =>
									updateStatus({
										appointmentId: appointment.id,
										status: "cancelled",
										successMessage: "Appointment cancelled",
									})
								}
								disabled={isUpdating}
							>
								Cancel
							</Button>
						</>
					)}
				</div>
			</div>
		</article>
	);
}
