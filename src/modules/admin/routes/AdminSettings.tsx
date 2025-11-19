import AdminHeader from "@/modules/admin/components/AdminHeader";

const AdminSettings = () => {
	return (
		<>
			<AdminHeader
				description="Configure studio policies, deposits, notifications, and branding."
				title="Studio settings"
			/>
			<div className="mt-10 space-y-6">
				<div className="rounded-3xl border border-white/10 bg-[#1f1818] p-8 text-white/70">
					<h2 className="text-lg font-semibold text-white">What’s next?</h2>
					<ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
						<li>Define deposit rules and cancellation buffers.</li>
						<li>Upload studio assets for outgoing communications.</li>
						<li>Connect notification providers for reminders.</li>
					</ul>
				</div>
				<div className="rounded-3xl border border-dashed border-white/15 bg-[#1f1818]/40 p-10 text-center text-white/50">
					<p className="text-sm">
						Settings management will live here. Hook this up to Firebase Remote Config or Firestore
						collections when ready.
					</p>
				</div>
			</div>
		</>
	);
};

export default AdminSettings;
