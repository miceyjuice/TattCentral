import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getAppointments } from "./getAppointments";
import type { AppointmentsResponse } from "../types";

export const useAppointments = (): UseQueryResult<AppointmentsResponse> => {
	const { user, userProfile } = useAuth();
	const userId = user?.uid;
	const role = userProfile?.role;

	return useQuery({
		queryKey: ["appointments", userId, role],
		queryFn: () => getAppointments(userId, role),
		enabled: !!userId && !!role,
		staleTime: 1000 * 60,
	});
};
