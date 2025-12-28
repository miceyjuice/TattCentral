import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { CreateAppointmentDialog } from "./CreateAppointmentDialog";

interface AdminHeaderProps {
	title: string;
	description: string;
}

const AdminHeader = ({ title, description }: AdminHeaderProps) => {
	const { logout, userProfile } = useAuth();
	const navigate = useNavigate();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		setIsSigningOut(true);

		try {
			await logout();
			navigate("/login", { replace: true });
		} catch (error) {
			console.error(error);
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<header className="flex flex-col gap-6 pb-10 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
				<p className="text-base text-white/60">{description}</p>
			</div>
			<div className="flex flex-3/5 items-center justify-end gap-4">
				<CreateAppointmentDialog />
				<button
					className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#241a1a] text-white/60 transition hover:text-white"
					type="button"
				>
					<Bell className="h-5 w-5" />
					<span className="absolute top-2 right-2 inline-flex h-2.5 w-2.5 rounded-full bg-[#e82933]" />
				</button>
				<div className="flex items-center gap-3 rounded-full bg-[#241a1a] px-3 py-2">
					<div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
						<img
							alt="Admin avatar"
							className="h-full w-full object-cover"
							src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80"
						/>
					</div>
					<div className="hidden text-sm font-medium text-white md:block">
						{userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Loading..."}
					</div>
				</div>
				<Button
					className="flex items-center gap-2 border-none bg-transparent px-5 py-2 text-sm text-white/70 transition hover:bg-transparent hover:text-gray-400"
					onClick={handleSignOut}
					type="button"
					disabled={isSigningOut}
					variant="outline"
				>
					<LogOut className="h-4 w-4" />
					<span>{isSigningOut ? "Logging out..." : "Log out"}</span>
				</Button>
			</div>
		</header>
	);
};

export default AdminHeader;
