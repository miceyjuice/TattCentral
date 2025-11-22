import { Button } from "@/components/ui/button";
import { useAppointments, type PastAppointment } from "@/features/appointments";
import AdminHeader from "@/modules/admin/components/AdminHeader";
import PastAppointmentsTable from "@/modules/admin/components/PastAppointmentsTable";

const AdminHistory = () => {
	const { data, isLoading, isError, error, refetch } = useAppointments();
	const pastAppointments: PastAppointment[] = data?.past ?? [];

	return (
		<>
			<AdminHeader
				description="Review completed sessions, request reviews, and keep tabs on follow-ups."
				title="Appointment history"
			/>
			<div className="mt-10 space-y-8">
				{isLoading ? (
					<PastAppointmentsSkeleton />
				) : isError ? (
					<div className="rounded-3xl border border-red-500/50 bg-red-500/10 p-8 text-red-200">
						<h2 className="text-lg font-semibold">We couldn’t load past appointments</h2>
						<p className="mt-2 text-sm text-red-100/80">Error: {error.message}</p>
						<Button className="mt-6" onClick={() => void refetch()} type="button" variant="outline">
							Retry
						</Button>
					</div>
				) : (
					<PastAppointmentsTable appointments={pastAppointments} />
				)}
			</div>
		</>
	);
};

const PastAppointmentsSkeleton = () => {
	return (
		<div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1f1818]/60">
			<div className="h-12 bg-white/5" />
			<ul className="divide-y divide-white/10">
				{Array.from({ length: 5 }).map((_, index) => (
					<li className="flex items-center gap-4 px-6 py-5" key={index}>
						<span className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
						<span className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
						<span className="ml-auto h-8 w-24 animate-pulse rounded-full bg-white/10" />
					</li>
				))}
			</ul>
		</div>
	);
};

export default AdminHistory;
