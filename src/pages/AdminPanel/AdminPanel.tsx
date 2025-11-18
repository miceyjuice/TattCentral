import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, Clock, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type AppointmentNav = "upcoming" | "past";

const navItems: Array<{ id: AppointmentNav; label: string; icon: LucideIcon }> = [
	{ id: "upcoming", label: "Upcoming", icon: CalendarDays },
	{ id: "past", label: "Past", icon: Clock },
];

const upcomingAppointments = [
	{
		id: "1",
		studio: "Sarah's Studio",
		dateRange: "July 15, 2024, 2:00 PM - 3:00 PM",
		image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=900&q=80",
	},
];

const pastAppointments = [
	{ id: "1", date: "June 10, 2024", artist: "Sarah's Studio", rating: "4 stars", action: "Review" },
	{ id: "2", date: "May 5, 2024", artist: "Sarah's Studio", rating: "5 stars", action: "Book Again" },
];

const AdminPanel = () => {
	const [activeTab, setActiveTab] = useState<AppointmentNav>("upcoming");

	const pastSection = (
		<section className="mt-12">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold tracking-tight">Past Appointments</h2>
			</div>
			<div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#1f1818] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.75)]">
				<table className="w-full table-fixed text-left text-sm text-white/80">
					<thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
						<tr>
							<th className="px-6 py-4">Date</th>
							<th className="px-6 py-4">Artist</th>
							<th className="px-6 py-4">Rating</th>
							<th className="px-6 py-4 text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{pastAppointments.map((item) => (
							<tr className="border-t border-white/5" key={item.id}>
								<td className="px-6 py-4 text-white">{item.date}</td>
								<td className="px-6 py-4 text-white/80">{item.artist}</td>
								<td className="px-6 py-4 text-white/70">{item.rating}</td>
								<td className="px-6 py-4 text-right">
									<button className="text-sm font-medium text-white transition hover:text-white/70">{item.action}</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);

	return (
		<div className="min-h-screen bg-[#171212] text-white">
			<div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-10 px-4 py-10 lg:flex-row lg:gap-16 lg:px-12">
				<aside className="flex h-full w-full flex-col justify-between rounded-4xl border border-white/10 bg-[#1d1616]/80 px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] lg:w-64">
					<div>
						<div className="mb-12 text-lg font-semibold tracking-[0.4em] text-white/80">TattCentral</div>
						<nav className="space-y-2">
							{navItems.map((item) => (
								<button
									className={cn(
										"flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm transition",
										activeTab === item.id ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
									)}
									key={item.id}
									onClick={() => setActiveTab(item.id)}
									type="button"
								>
									<item.icon className="h-5 w-5" />
									<span>{item.label}</span>
								</button>
							))}
						</nav>
					</div>
					<button
						className="flex items-center justify-between rounded-3xl bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10"
						type="button"
					>
						<span>Profile</span>
						<UserRound className="h-5 w-5" />
					</button>
				</aside>
				<main className="flex-1 pb-16">
					<Header />
					<div className="mt-10 space-y-12">
						{activeTab === "upcoming" ? (
							<>
								<section className="grid gap-10 lg:grid-cols-[minmax(0,420px)]">
									{upcomingAppointments.map((appointment) => (
										<article
											className="rounded-4xl border border-white/10 bg-[#1f1818] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
											key={appointment.id}
										>
											<div className="h-60 w-full overflow-hidden rounded-t-4xl">
												<img alt={appointment.studio} className="h-full w-full object-cover" src={appointment.image} />
											</div>
											<div className="space-y-5 px-8 pb-8 pt-6">
												<div className="space-y-2">
													<h2 className="text-xl font-semibold">{appointment.studio}</h2>
													<p className="text-sm text-white/60">{appointment.dateRange}</p>
												</div>
												<div className="flex gap-3">
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
												</div>
											</div>
										</article>
									))}
								</section>
								{pastSection}
							</>
						) : (
							pastSection
						)}
					</div>
				</main>
			</div>
		</div>
	);
};

function Header() {
	const { logout } = useAuth();
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
		<header className="flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Upcoming appointments</h1>
				<p className="text-base text-white/60">Manage sessions, confirm bookings, and keep clients updated.</p>
			</div>
			<div className="flex flex-wrap items-center gap-4">
				<button
					className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#241a1a] text-white/60 transition hover:text-white"
					type="button"
				>
					<Bell className="h-5 w-5" />
					<span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-[#e82933]" />
				</button>
				<div className="flex items-center gap-3 rounded-full bg-[#241a1a] px-3 py-2">
					<div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
						<img
							alt="Admin avatar"
							className="h-full w-full object-cover"
							src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80"
						/>
					</div>
					<div className="hidden text-sm font-medium text-white md:block">Alex Morgan</div>
				</div>
				<Button
					className="flex items-center gap-2 bg-transparent border-none px-5 py-2 text-sm text-white/70 transition hover:bg-transparent hover:text-gray-400"
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
}

export default AdminPanel;
