import type { AppointmentsResponse } from "../types";
import { mockAppointments } from "../fixtures";

export const getAppointments = async (): Promise<AppointmentsResponse> => {
	await new Promise((resolve) => setTimeout(resolve, 250));

	return JSON.parse(JSON.stringify(mockAppointments)) as AppointmentsResponse;
};
