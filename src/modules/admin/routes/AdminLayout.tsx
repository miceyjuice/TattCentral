import type { LucideIcon } from "lucide-react";
import { CalendarDays, Clock, Settings2, Users2 } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

type AdminNavItem = {
	label: string;
	to: string;
	icon: LucideIcon;
	end?: boolean;
};

const adminNavItems: AdminNavItem[] = [
	{ label: "Dashboard", to: "/admin", icon: CalendarDays, end: true },
	{ label: "History", to: "/admin/history", icon: Clock },
	{ label: "Artists", to: "/admin/artists", icon: Users2 },
	{ label: "Settings", to: "/admin/settings", icon: Settings2 },
];

const AdminLayout = () => {
	return (
		<div className="min-h-screen bg-[#171212] text-white">
			<div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-10 px-4 pt-20 pb-10 lg:flex-row lg:gap-16 lg:px-12">
				<aside className="flex h-full w-full flex-col justify-between space-y-2 lg:w-64">
					<div>
						<div className="mb-8 pt-4 text-2xl font-semibold text-white/80">TattCentral</div>
						<nav className="space-y-2">
							{adminNavItems.map((item) => (
								<NavLink
									className={({ isActive }) =>
										cn(
											"flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm transition",
											isActive
												? "bg-white/10 text-white"
												: "text-white/50 hover:bg-white/5 hover:text-white",
										)
									}
									end={item.end ?? false}
									key={item.to}
									to={item.to}
								>
									<item.icon className="h-5 w-5" />
									<span>{item.label}</span>
								</NavLink>
							))}
						</nav>
					</div>
				</aside>
				<main className="flex-1 pb-16">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
