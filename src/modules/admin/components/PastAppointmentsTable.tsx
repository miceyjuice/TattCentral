import type { PastAppointment } from "@/features/appointments";

interface PastAppointmentsTableProps {
	appointments: PastAppointment[];
	title?: string;
	subtitle?: string;
	emptyMessage?: string;
	showHeading?: boolean;
}

const PastAppointmentsTable = ({
	appointments,
	title = "Past Appointments",
	subtitle,
	emptyMessage = "No past appointments yet.",
	showHeading = true,
}: PastAppointmentsTableProps) => {
	if (!appointments.length) {
		return (
			<section className="rounded-3xl border border-white/10 bg-[#1f1818] p-8 text-white/60">
				{showHeading ? <h2 className="text-lg font-semibold text-white">{title}</h2> : null}
				{subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
				<p className="text-sm">{emptyMessage}</p>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			{showHeading ? (
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold tracking-tight">{title}</h2>
					{subtitle ? <p className="text-xs text-white/40 uppercase">{subtitle}</p> : null}
				</div>
			) : null}
			<div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1f1818] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.75)]">
				<table className="w-full table-fixed text-left text-sm text-white/80">
					<thead className="bg-white/5 text-xs tracking-widest text-white/50 uppercase">
						<tr>
							<th className="px-6 py-4">Date</th>
							<th className="px-6 py-4">Client</th>
							<th className="px-6 py-4">Rating</th>
							<th className="px-6 py-4 text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{appointments.map((item) => (
							<tr className="border-t border-white/5" key={item.id}>
								<td className="px-6 py-4 text-white">{item.date}</td>
								<td className="px-6 py-4 text-white/80">{item.title}</td>
								<td className="px-6 py-4 text-white/60">{item.rating}</td>
								<td className="px-6 py-4 text-right">
									<button className="text-sm font-medium text-white transition hover:text-white/70">
										{item.action}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default PastAppointmentsTable;
