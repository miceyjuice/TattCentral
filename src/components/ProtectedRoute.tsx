import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
	children: ReactNode;
	redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = "/login" }: ProtectedRouteProps) => {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#171212] text-white">
				<span className="text-sm tracking-[0.3em] text-white/60 uppercase">Loading</span>
			</div>
		);
	}

	if (!user) {
		return <Navigate to={redirectTo} replace state={{ from: location }} />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
