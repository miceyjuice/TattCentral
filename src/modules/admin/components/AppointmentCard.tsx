import { Button } from "@/components/ui/button";
import { useUpdateAppointmentStatus, type UpcomingAppointment } from "@/features/appointments";

interface AppointmentCardProps {
	appointment: UpcomingAppointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
	const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatus();

	return (
		<article className="rounded-4xl border border-white/10 bg-[#1f1818] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
			<div className="relative h-60 w-full overflow-hidden rounded-t-4xl">
				<img alt={appointment.title} className="h-full w-full object-cover" src={appointment.image} />
				{appointment.status === "pending" && (
					<span className="absolute top-4 right-4 rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-bold text-black backdrop-blur-sm">
						PENDING
					</span>
				)}
			</div>
			<div className="space-y-5 px-8 py-6">
				<div className="space-y-2">
					<h2 className="text-xl font-semibold">{appointment.title}</h2>
					<p className="text-sm text-white/60">{appointment.dateRange}</p>
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
