/**
 * Test fixtures for appointment data
 *
 * Factory functions for creating realistic test data
 */

import { createMockTimestamp } from "../setup-integration.js";
import type { AppointmentData, AppointmentStatus } from "../../types/index.js";

/**
 * Default appointment data for testing
 */
export function createTestAppointment(overrides: Partial<AppointmentData> = {}): AppointmentData {
	const now = new Date();
	const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
	const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

	return {
		id: "test-appointment-123",
		artistId: "artist-001",
		artistName: "John Ink",
		clientId: "client-001",
		clientName: "Jane Doe",
		clientEmail: "jane.doe@example.com",
		clientPhone: "+48123456789",
		description: "Small tattoo on forearm",
		type: "Tattoo",
		startTime: createMockTimestamp(startTime),
		endTime: createMockTimestamp(endTime),
		status: "pending" as AppointmentStatus,
		cancellationToken: "test-token-abc123",
		createdAt: createMockTimestamp(now),
		updatedAt: createMockTimestamp(now),
		...overrides,
	};
}

/**
 * Creates appointment with specific status
 */
export function createAppointmentWithStatus(
	status: AppointmentStatus,
	overrides: Partial<AppointmentData> = {},
): AppointmentData {
	return createTestAppointment({ status, ...overrides });
}

/**
 * Creates appointment without cancellation token (legacy flow)
 */
export function createAppointmentWithoutToken(overrides: Partial<AppointmentData> = {}): AppointmentData {
	const appointment = createTestAppointment(overrides);
	delete (appointment as Partial<AppointmentData>).cancellationToken;
	return appointment as AppointmentData;
}

/**
 * Creates appointment with invalid email
 */
export function createAppointmentWithInvalidEmail(overrides: Partial<AppointmentData> = {}): AppointmentData {
	return createTestAppointment({
		clientEmail: "invalid-email",
		...overrides,
	});
}

/**
 * Creates a rescheduled appointment (different times)
 */
export function createRescheduledAppointment(original: AppointmentData, hoursOffset: number = 24): AppointmentData {
	const newStartTime = new Date(original.startTime.toDate().getTime() + hoursOffset * 60 * 60 * 1000);
	const newEndTime = new Date(original.endTime.toDate().getTime() + hoursOffset * 60 * 60 * 1000);

	return {
		...original,
		startTime: createMockTimestamp(newStartTime),
		endTime: createMockTimestamp(newEndTime),
		updatedAt: createMockTimestamp(new Date()),
	};
}
