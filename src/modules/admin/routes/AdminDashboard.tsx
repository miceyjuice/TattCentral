import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppointments, type UpcomingAppointment, type PastAppointment } from "@/features/appointments";
import AdminHeader from "@/modules/admin/components/AdminHeader";
import PastAppointmentsTable from "@/modules/admin/components/PastAppointmentsTable";
import { AppointmentCard } from "@/modules/admin/components/AppointmentCard";
import { AppointmentDetailSheet } from "@/modules/admin/components/AppointmentDetailSheet";

const AdminDashboard = () => {
	const { data, isLoading, isError, error, refetch } = useAppointments();
	const upcomingAppointments: UpcomingAppointment[] = data?.upcoming ?? [];
	const pastAppointments: PastAppointment[] = data?.past ?? [];

	const [selectedAppointment, setSelectedAppointment] = useState<UpcomingAppointment | null>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const handleOpenDetail = (appointment: UpcomingAppointment) => {
		setSelectedAppointment(appointment);
		setIsSheetOpen(true);
	};

	return (
		<>
			<AdminHeader description="Manage sessions, confirm bookings, and keep clients updated." title="Dashboard" />
			<div className="mt-10 space-y-12">
				{isLoading ? (
					<UpcomingAppointmentsSkeleton />
				) : isError ? (
					<UpcomingAppointmentsError errorMessage={error.message} onRetry={() => void refetch()} />
				) : upcomingAppointments.length ? (
					<section className="grid [grid-template-columns:repeat(3,1fr)] gap-6">
						{upcomingAppointments.map((appointment) => (
							<AppointmentCard
								key={appointment.id}
								appointment={appointment}
								onViewDetails={() => handleOpenDetail(appointment)}
							/>
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

			<AppointmentDetailSheet
				appointment={selectedAppointment}
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
			/>
		</>
	);
};

const UpcomingAppointmentsSkeleton = () => {
	return (
		<section className="grid gap-6 lg:[grid-template-columns:repeat(3,1fr)]">
			{Array.from({ length: 3 }).map((_, index) => (
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
