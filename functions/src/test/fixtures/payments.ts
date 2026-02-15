/**
 * Test fixtures for payment data
 *
 * Factory functions for creating checkout request and pending appointment data
 */

import type { CreateCheckoutRequest, AppointmentDataInput } from "../../payments/types.js";

/**
 * Creates a valid checkout request for testing
 */
export function createCheckoutRequest(overrides: Partial<CreateCheckoutRequest> = {}): CreateCheckoutRequest {
	const now = new Date();
	const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
	const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

	return {
		appointmentData: {
			artistId: "artist-001",
			artistName: "John Ink",
			clientName: "Jane Doe",
			clientEmail: "jane.doe@example.com",
			clientPhone: "+48123456789",
			description: "Small tattoo on forearm",
			type: "Tattoo",
			startTime: startTime.toISOString(),
			endTime: endTime.toISOString(),
			referenceImageUrls: [],
			referenceImagePaths: [],
		},
		serviceId: "small",
		successUrl: "https://example.com/success",
		cancelUrl: "https://example.com/cancel",
		...overrides,
	};
}

/**
 * Creates checkout request with appointment data overrides
 */
export function createCheckoutRequestWithAppointment(
	appointmentOverrides: Partial<AppointmentDataInput>,
	requestOverrides: Partial<CreateCheckoutRequest> = {},
): CreateCheckoutRequest {
	const base = createCheckoutRequest(requestOverrides);
	return {
		...base,
		appointmentData: {
			...base.appointmentData,
			...appointmentOverrides,
		},
	};
}

/**
 * Creates a checkout request for a consultation (free service)
 */
export function createConsultationRequest(overrides: Partial<CreateCheckoutRequest> = {}): CreateCheckoutRequest {
	return createCheckoutRequest({
		serviceId: "consultation",
		...overrides,
	});
}

/**
 * Creates a pending appointment data structure as stored in Firestore
 */
export function createPendingAppointmentData(
	overrides: Partial<AppointmentDataInput & { serviceId: string; depositAmount: number }> = {},
) {
	const now = new Date();
	const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
	const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

	return {
		artistId: "artist-001",
		artistName: "John Ink",
		clientName: "Jane Doe",
		clientEmail: "jane.doe@example.com",
		clientPhone: "+48123456789",
		description: "Small tattoo on forearm",
		type: "Tattoo",
		startTime: startTime.toISOString(),
		endTime: endTime.toISOString(),
		referenceImageUrls: [],
		referenceImagePaths: [],
		serviceId: "small",
		depositAmount: 50, // In PLN
		...overrides,
	};
}

/**
 * Creates checkout request with missing fields for validation testing
 */
export function createInvalidCheckoutRequest(
	missingFields: Array<keyof CreateCheckoutRequest | keyof AppointmentDataInput>,
): Partial<CreateCheckoutRequest> {
	const request = createCheckoutRequest() as unknown as Record<string, unknown>;

	for (const field of missingFields) {
		if (field in request) {
			delete request[field];
		} else if (request.appointmentData && field in (request.appointmentData as Record<string, unknown>)) {
			delete (request.appointmentData as Record<string, unknown>)[field];
		}
	}

	return request as Partial<CreateCheckoutRequest>;
}

/**
 * Creates checkout request with past appointment time
 */
export function createPastAppointmentRequest(): CreateCheckoutRequest {
	const pastTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
	const endTime = new Date(pastTime.getTime() + 60 * 60 * 1000);

	return createCheckoutRequestWithAppointment({
		startTime: pastTime.toISOString(),
		endTime: endTime.toISOString(),
	});
}

/**
 * Creates checkout request with invalid time range
 */
export function createInvalidTimeRangeRequest(): CreateCheckoutRequest {
	const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
	const endTime = new Date(startTime.getTime() - 60 * 60 * 1000); // End before start

	return createCheckoutRequestWithAppointment({
		startTime: startTime.toISOString(),
		endTime: endTime.toISOString(),
	});
}
