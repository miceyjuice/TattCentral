import AdminHeader from "@/modules/admin/components/AdminHeader";

const AdminArtists = () => {
	return (
		<>
			<AdminHeader
				description="Invite or manage artists, adjust permissions, and set working hours."
				title="Artists"
			/>
			<div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-[#1f1818]/40 p-10 text-center text-white/60">
				<p className="text-sm">
					Artist management is coming soon. Define user roles and onboarding steps here.
				</p>
			</div>
		</>
	);
};

export default AdminArtists;
