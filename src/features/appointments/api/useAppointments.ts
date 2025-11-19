import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAppointments } from "./getAppointments";
import type { AppointmentsResponse } from "../types";

export const useAppointments = (): UseQueryResult<AppointmentsResponse> => {
	return useQuery({
		queryKey: ["appointments"],
		queryFn: getAppointments,
		staleTime: 1000 * 60,
	});
};
