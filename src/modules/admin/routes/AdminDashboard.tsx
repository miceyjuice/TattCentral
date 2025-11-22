import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppointments, type UpcomingAppointment, type PastAppointment } from "@/features/appointments";
import AdminHeader from "@/modules/admin/components/AdminHeader";
import PastAppointmentsTable from "@/modules/admin/components/PastAppointmentsTable";

const AdminDashboard = () => {
	const { data, isLoading, isError, error, refetch } = useAppointments();
	const upcomingAppointments: UpcomingAppointment[] = data?.upcoming ?? [];
	const pastAppointments: PastAppointment[] = data?.past ?? [];

	return (
		<>
			<AdminHeader description="Manage sessions, confirm bookings, and keep clients updated." title="Dashboard" />
			<div className="mt-10 space-y-12">
				{isLoading ? (
					<UpcomingAppointmentsSkeleton />
				) : isError ? (
					<UpcomingAppointmentsError errorMessage={error.message} onRetry={() => void refetch()} />
				) : upcomingAppointments.length ? (
					<section className="flex gap-8">
						{upcomingAppointments.map((appointment) => (
							<article
								className="w-1/2 rounded-4xl border border-white/10 bg-[#1f1818] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
								key={appointment.id}
							>
								<div className="relative h-60 w-full overflow-hidden rounded-t-4xl">
									<img
										alt={appointment.title}
										className="h-full w-full object-cover"
										src={appointment.image}
									/>
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
												>
													Approve
												</Button>
												<Button
													className="rounded-full border border-white/20 bg-transparent px-6 py-5 text-sm font-medium text-white transition hover:bg-white/10"
													type="button"
													variant="outline"
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
												>
													Cancel
												</Button>
											</>
										)}
									</div>
								</div>
							</article>
						))}
					</section>
				) : (
					<UpcomingAppointmentsEmptyState />
				)}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-white">Recent history</h2>
						<Link className="text-sm text-white/60 transition hover:text-white" to="/admin/history">
							View all
						</Link>
					</div>
					<PastAppointmentsTable
						appointments={pastAppointments.slice(0, 3)}
						emptyMessage="No completed appointments yet."
						showHeading={false}
					/>
				</div>
			</div>
		</>
	);
};

const UpcomingAppointmentsSkeleton = () => {
	return (
		<section className="grid gap-10 lg:grid-cols-[minmax(0,420px)]">
			{Array.from({ length: 2 }).map((_, index) => (
				<div
					className="animate-pulse overflow-hidden rounded-4xl border border-white/10 bg-[#1f1818]/60"
					key={index}
				>
					<div className="h-60 w-full bg-white/5" />
					<div className="space-y-4 px-8 pt-6 pb-8">
						<div className="h-6 w-2/3 rounded-full bg-white/10" />
						<div className="h-4 w-1/2 rounded-full bg-white/10" />
						<div className="flex gap-3">
							<div className="h-10 w-24 rounded-full bg-white/10" />
							<div className="h-10 w-24 rounded-full bg-white/10" />
						</div>
					</div>
				</div>
			))}
		</section>
	);
};

const UpcomingAppointmentsError = ({ errorMessage, onRetry }: { errorMessage: string; onRetry: () => void }) => {
	return (
		<div className="rounded-4xl border border-red-500/50 bg-red-500/10 p-8 text-red-200">
			<h2 className="text-lg font-semibold">We couldn’t load upcoming appointments</h2>
			<p className="mt-2 text-sm text-red-100/80">Error: {errorMessage}</p>
			<Button className="mt-6" onClick={onRetry} type="button" variant="outline">
				Try again
			</Button>
		</div>
	);
};

const UpcomingAppointmentsEmptyState = () => {
	return (
		<div className="rounded-4xl border border-dashed border-white/15 bg-[#1f1818]/40 p-10 text-center text-white/60">
			<h2 className="text-xl font-semibold text-white">No upcoming appointments</h2>
			<p className="mt-2 text-sm">
				New bookings will appear here. Add availability for artists or create a manual booking to get started.
			</p>
			<Button className="mt-6" type="button">
				Create booking
			</Button>
		</div>
	);
};

export default AdminDashboard;
