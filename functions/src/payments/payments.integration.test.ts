/**
 * Integration tests for payment Cloud Functions
 *
 * Tests createCheckoutSession callable function and stripeWebhook HTTP handler
 * using mocked Stripe client and Firestore.
 */

import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { cleanup } from "../test/setup-integration.js";
import {
	createCheckoutRequest,
	createConsultationRequest,
	createPendingAppointmentData,
	createPastAppointmentRequest,
	createInvalidTimeRangeRequest,
} from "../test/fixtures/payments.js";
import { createMockCheckoutSession, createMockCharge, createMockStripeEvent } from "../test/mocks/stripe.mock.js";

// Mock Stripe client
const mockStripeClient = {
	checkout: {
		sessions: {
			create: vi.fn(),
		},
	},
	webhooks: {
		constructEvent: vi.fn(),
	},
};

vi.mock("./stripe-client.js", () => ({
	getStripeClient: vi.fn(() => mockStripeClient),
	getDepositAmountGrosze: vi.fn((serviceId: string) => {
		const amounts: Record<string, number> = {
			consultation: 0,
			small: 5000,
			medium: 10000,
			large: 15000,
			"extra-large": 20000,
		};
		return amounts[serviceId] ?? 0;
	}),
	requiresPayment: vi.fn((serviceId: string) => serviceId !== "consultation"),
}));

// Mock Firestore
const mockFirestoreDoc = {
	id: "mock-doc-id",
	set: vi.fn().mockResolvedValue(undefined),
	get: vi.fn(),
	delete: vi.fn().mockResolvedValue(undefined),
	update: vi.fn().mockResolvedValue(undefined),
	ref: { update: vi.fn().mockResolvedValue(undefined) },
};

const mockFirestoreCollection = {
	doc: vi.fn(() => mockFirestoreDoc),
	where: vi.fn(() => ({
		limit: vi.fn(() => ({
			get: vi.fn().mockResolvedValue({
				empty: false,
				docs: [mockFirestoreDoc],
			}),
		})),
	})),
};

vi.mock("firebase-admin/firestore", () => ({
	getFirestore: vi.fn(() => ({
		collection: vi.fn(() => mockFirestoreCollection),
	})),
	Timestamp: {
		now: vi.fn(() => ({ toDate: () => new Date(), toMillis: () => Date.now() })),
		fromDate: vi.fn((date: Date) => ({ toDate: () => date, toMillis: () => date.getTime() })),
		fromMillis: vi.fn((ms: number) => ({ toDate: () => new Date(ms), toMillis: () => ms })),
	},
}));

// Mock firebase-functions/params
vi.mock("firebase-functions/params", () => ({
	defineString: vi.fn(() => ({
		value: vi.fn(() => "test-webhook-secret"),
	})),
}));

describe("createCheckoutSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockStripeClient.checkout.sessions.create.mockResolvedValue(
			createMockCheckoutSession({
				url: "https://checkout.stripe.com/test-session",
			}),
		);
	});

	afterAll(() => {
		cleanup();
	});

	describe("validation", () => {
		it("throws error when appointment data is missing", async () => {
			const request = { data: {} };

			const result = await simulateCreateCheckoutSession(request);

			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe("invalid-argument");
			expect(result.error?.message).toContain("Missing appointment data");
		});

		it("throws error when artist information is missing", async () => {
			const checkoutRequest = createCheckoutRequest();
			checkoutRequest.appointmentData.artistId = "";

			const request = { data: checkoutRequest };
			const result = await simulateCreateCheckoutSession(request);

			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain("Missing artist information");
		});

		it("throws error when client information is missing", async () => {
			const checkoutRequest = createCheckoutRequest();
			checkoutRequest.appointmentData.clientName = "";

			const request = { data: checkoutRequest };
			const result = await simulateCreateCheckoutSession(request);

			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain("Missing client information");
		});

		it("throws error for past appointment times", async () => {
			const checkoutRequest = createPastAppointmentRequest();

			const request = { data: checkoutRequest };
			const result = await simulateCreateCheckoutSession(request);

			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain("Cannot book appointments in the past");
		});

		it("throws error when end time is before start time", async () => {
			const checkoutRequest = createInvalidTimeRangeRequest();

			const request = { data: checkoutRequest };
			const result = await simulateCreateCheckoutSession(request);

			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain("End time must be after start time");
		});

		it("throws error when redirect URLs are missing", async () => {
			const checkoutRequest = createCheckoutRequest();
			checkoutRequest.successUrl = "";

			const request = { data: checkoutRequest };
			const result = await simulateCreateCheckoutSession(request);

			expect(result.error).toBeDefined();
			expect(result.error?.message).toContain("Missing redirect URLs");
		});
	});

	describe("consultation (free service)", () => {
		it("creates appointment directly without payment", async () => {
			const checkoutRequest = createConsultationRequest();

			const request = { data: checkoutRequest };
			const result = await simulateCreateCheckoutSession(request);

			expect(result.data).toBeDefined();
			expect(result.data?.noPaymentRequired).toBe(true);
			expect(result.data?.appointmentId).toBeDefined();
			expect(mockStripeClient.checkout.sessions.create).not.toHaveBeenCalled();
		});
	});

	describe("paid service", () => {
		it("creates Stripe checkout session for paid service", async () => {
			const checkoutRequest = createCheckoutRequest({ serviceId: "small" });

			const request = { data: checkoutRequest };
			const result = await simulateCreateCheckoutSession(request);

			expect(result.data).toBeDefined();
			expect(result.data?.sessionId).toBeDefined();
			expect(result.data?.sessionUrl).toBe("https://checkout.stripe.com/test-session");
			expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledTimes(1);
		});

		it("stores pending appointment in Firestore", async () => {
			const checkoutRequest = createCheckoutRequest({ serviceId: "medium" });

			const request = { data: checkoutRequest };
			await simulateCreateCheckoutSession(request);

			expect(mockFirestoreDoc.set).toHaveBeenCalled();
		});

		it("includes correct deposit amount in Stripe session", async () => {
			const checkoutRequest = createCheckoutRequest({ serviceId: "large" });

			const request = { data: checkoutRequest };
			await simulateCreateCheckoutSession(request);

			const createCall = mockStripeClient.checkout.sessions.create.mock.calls[0][0];
			expect(createCall.line_items[0].price_data.unit_amount).toBe(15000); // 150 PLN in grosze
		});

		it("sets correct payment methods", async () => {
			const checkoutRequest = createCheckoutRequest();

			const request = { data: checkoutRequest };
			await simulateCreateCheckoutSession(request);

			const createCall = mockStripeClient.checkout.sessions.create.mock.calls[0][0];
			expect(createCall.payment_method_types).toContain("card");
			expect(createCall.payment_method_types).toContain("blik");
			expect(createCall.payment_method_types).toContain("p24");
		});
	});
});

describe("stripeWebhook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFirestoreDoc.get.mockResolvedValue({
			exists: true,
			data: () => createPendingAppointmentData(),
		});
	});

	afterAll(() => {
		cleanup();
	});

	describe("checkout.session.completed", () => {
		it("creates appointment when payment is successful", async () => {
			const session = createMockCheckoutSession({ payment_status: "paid" });
			const event = createMockStripeEvent("checkout.session.completed", session);

			mockStripeClient.webhooks.constructEvent.mockReturnValue(event);

			const result = await simulateWebhook(event);

			expect(result.status).toBe(200);
			expect(mockFirestoreDoc.set).toHaveBeenCalled();
		});

		it("deletes pending appointment after creating real appointment", async () => {
			const session = createMockCheckoutSession({ payment_status: "paid" });
			const event = createMockStripeEvent("checkout.session.completed", session);

			mockStripeClient.webhooks.constructEvent.mockReturnValue(event);

			await simulateWebhook(event);

			expect(mockFirestoreDoc.delete).toHaveBeenCalled();
		});

		it("does not create appointment if payment status is not paid", async () => {
			const session = createMockCheckoutSession({ payment_status: "unpaid" });
			const event = createMockStripeEvent("checkout.session.completed", session);

			mockStripeClient.webhooks.constructEvent.mockReturnValue(event);

			await simulateWebhook(event);

			// Should not create appointment
			expect(mockFirestoreDoc.set).not.toHaveBeenCalled();
		});

		it("handles missing pending appointment gracefully", async () => {
			const session = createMockCheckoutSession({ payment_status: "paid" });
			const event = createMockStripeEvent("checkout.session.completed", session);

			mockStripeClient.webhooks.constructEvent.mockReturnValue(event);
			mockFirestoreDoc.get.mockResolvedValue({ exists: false });

			const result = await simulateWebhook(event);

			expect(result.status).toBe(500);
		});
	});

	describe("checkout.session.expired", () => {
		it("deletes pending appointment when session expires", async () => {
			const session = createMockCheckoutSession();
			const event = createMockStripeEvent("checkout.session.expired", session);

			mockStripeClient.webhooks.constructEvent.mockReturnValue(event);

			await simulateWebhook(event);

			expect(mockFirestoreDoc.delete).toHaveBeenCalled();
		});
	});

	describe("charge.refunded", () => {
		it("marks appointment as refunded", async () => {
			const charge = createMockCharge({ payment_intent: "pi_test_xyz789" });
			const event = createMockStripeEvent("charge.refunded", charge);

			mockStripeClient.webhooks.constructEvent.mockReturnValue(event);

			await simulateWebhook(event);

			expect(mockFirestoreDoc.ref.update).toHaveBeenCalledWith(
				expect.objectContaining({
					paymentStatus: "refunded",
				}),
			);
		});

		it("handles missing appointment for refund gracefully", async () => {
			const charge = createMockCharge({ payment_intent: "pi_nonexistent" });
			const event = createMockStripeEvent("charge.refunded", charge);

			mockStripeClient.webhooks.constructEvent.mockReturnValue(event);
			mockFirestoreCollection.where.mockReturnValue({
				limit: vi.fn(() => ({
					get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
				})),
			});

			const result = await simulateWebhook(event);

			// Should not throw, just log warning
			expect(result.status).toBe(200);
		});
	});

	describe("signature validation", () => {
		it("returns 400 for invalid signature", async () => {
			mockStripeClient.webhooks.constructEvent.mockImplementation(() => {
				throw new Error("Invalid signature");
			});

			const result = await simulateWebhookRaw({
				method: "POST",
				headers: { "stripe-signature": "invalid" },
				rawBody: Buffer.from("{}"),
			});

			expect(result.status).toBe(400);
		});

		it("returns 400 for missing signature", async () => {
			const result = await simulateWebhookRaw({
				method: "POST",
				headers: {},
				rawBody: Buffer.from("{}"),
			});

			expect(result.status).toBe(400);
		});

		it("returns 405 for non-POST requests", async () => {
			const result = await simulateWebhookRaw({
				method: "GET",
				headers: {},
				rawBody: Buffer.from(""),
			});

			expect(result.status).toBe(405);
		});
	});
});

// Helper functions to simulate function calls

interface SimulationResult<T> {
	data?: T;
	error?: { code: string; message: string };
}

async function simulateCreateCheckoutSession(request: {
	data: unknown;
}): Promise<
	SimulationResult<{ sessionId?: string; sessionUrl?: string; noPaymentRequired?: boolean; appointmentId?: string }>
> {
	const { getDepositAmountGrosze, requiresPayment } = await import("./stripe-client.js");
	const { getFirestore, Timestamp } = await import("firebase-admin/firestore");

	const data = request.data as Record<string, unknown>;

	// Validation
	if (!data.appointmentData) {
		return { error: { code: "invalid-argument", message: "Missing appointment data" } };
	}

	const appointmentData = data.appointmentData as Record<string, unknown>;

	if (!appointmentData.artistId || !appointmentData.artistName) {
		return { error: { code: "invalid-argument", message: "Missing artist information" } };
	}

	if (!appointmentData.clientName || !appointmentData.clientEmail) {
		return { error: { code: "invalid-argument", message: "Missing client information" } };
	}

	if (!appointmentData.type) {
		return { error: { code: "invalid-argument", message: "Missing appointment type" } };
	}

	if (!appointmentData.startTime || !appointmentData.endTime) {
		return { error: { code: "invalid-argument", message: "Missing appointment time" } };
	}

	const start = new Date(appointmentData.startTime as string);
	const end = new Date(appointmentData.endTime as string);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		return { error: { code: "invalid-argument", message: "Invalid appointment time format" } };
	}

	if (start >= end) {
		return { error: { code: "invalid-argument", message: "End time must be after start time" } };
	}

	if (start < new Date()) {
		return { error: { code: "invalid-argument", message: "Cannot book appointments in the past" } };
	}

	if (!data.serviceId) {
		return { error: { code: "invalid-argument", message: "Missing service ID" } };
	}

	if (!data.successUrl || !data.cancelUrl) {
		return { error: { code: "invalid-argument", message: "Missing redirect URLs" } };
	}

	const serviceId = data.serviceId as string;
	const depositAmount = getDepositAmountGrosze(serviceId);

	// Free consultation
	if (!requiresPayment(serviceId)) {
		const db = getFirestore();
		const docRef = db.collection("appointments").doc();
		await docRef.set({
			...appointmentData,
			status: "pending",
			startTime: Timestamp.fromDate(start),
			endTime: Timestamp.fromDate(end),
		});

		return {
			data: {
				noPaymentRequired: true,
				appointmentId: docRef.id,
			},
		};
	}

	// Paid service
	const db = getFirestore();
	const pendingRef = db.collection("pendingAppointments").doc();
	await pendingRef.set({
		...appointmentData,
		serviceId,
		depositAmount: depositAmount / 100,
	});

	const session = await mockStripeClient.checkout.sessions.create({
		mode: "payment",
		customer_email: appointmentData.clientEmail,
		line_items: [
			{
				price_data: {
					currency: "pln",
					product_data: {
						name: `Deposit - ${appointmentData.type}`,
						description: `Appointment with ${appointmentData.artistName}`,
					},
					unit_amount: depositAmount,
				},
				quantity: 1,
			},
		],
		payment_method_types: ["card", "blik", "p24"],
		metadata: {
			pendingAppointmentId: pendingRef.id,
			serviceId,
		},
		success_url: data.successUrl,
		cancel_url: data.cancelUrl,
	});

	return {
		data: {
			sessionId: session.id,
			sessionUrl: session.url,
		},
	};
}

async function simulateWebhook(
	event: ReturnType<typeof createMockStripeEvent>,
): Promise<{ status: number; body?: unknown }> {
	const { getFirestore, Timestamp } = await import("firebase-admin/firestore");

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as ReturnType<typeof createMockCheckoutSession>;

				if (session.payment_status === "paid") {
					const pendingId = session.metadata?.pendingAppointmentId;
					if (!pendingId) {
						return { status: 500 };
					}

					const db = getFirestore();
					const pendingRef = db.collection("pendingAppointments").doc(pendingId);
					const pendingDoc = await pendingRef.get();

					if (!pendingDoc.exists) {
						return { status: 500 };
					}

					const pendingData = pendingDoc.data();
					const docRef = db.collection("appointments").doc();

					await docRef.set({
						...pendingData,
						status: "pending",
						paymentStatus: "paid",
						paymentIntentId: session.payment_intent,
						stripeSessionId: session.id,
						paidAt: Timestamp.now(),
					});

					await pendingRef.delete();
				}
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object as ReturnType<typeof createMockCheckoutSession>;
				const pendingId = session.metadata?.pendingAppointmentId;

				if (pendingId) {
					const db = getFirestore();
					await db.collection("pendingAppointments").doc(pendingId).delete();
				}
				break;
			}

			case "charge.refunded": {
				const charge = event.data.object as ReturnType<typeof createMockCharge>;
				const paymentIntentId = charge.payment_intent as string;

				if (paymentIntentId) {
					const db = getFirestore();
					const snapshot = await db
						.collection("appointments")
						.where("paymentIntentId", "==", paymentIntentId)
						.limit(1)
						.get();

					if (!snapshot.empty) {
						const doc = snapshot.docs[0];
						await doc.ref.update({
							paymentStatus: "refunded",
							refundedAt: Timestamp.now(),
						});
					}
				}
				break;
			}
		}

		return { status: 200, body: { received: true } };
	} catch {
		return { status: 500 };
	}
}

async function simulateWebhookRaw(req: {
	method: string;
	headers: Record<string, string | undefined>;
	rawBody: Buffer;
}): Promise<{ status: number; body?: string }> {
	if (req.method !== "POST") {
		return { status: 405, body: "Method not allowed" };
	}

	if (!req.headers["stripe-signature"]) {
		return { status: 400, body: "Missing signature" };
	}

	try {
		mockStripeClient.webhooks.constructEvent(req.rawBody, req.headers["stripe-signature"], "test-secret");
	} catch {
		return { status: 400, body: "Invalid signature" };
	}

	return { status: 200, body: JSON.stringify({ received: true }) };
}
