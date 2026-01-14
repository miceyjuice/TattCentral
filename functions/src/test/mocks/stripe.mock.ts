/**
 * Stripe mock utilities for integration testing
 *
 * Provides mock Stripe client and webhook event factories
 * for testing payment flows without hitting the Stripe API.
 */

import { vi } from "vitest";
import type Stripe from "stripe";

/**
 * Mock Stripe Checkout Session
 */
export function createMockCheckoutSession(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
	return {
		id: "cs_test_abc123",
		object: "checkout.session",
		payment_status: "paid",
		payment_intent: "pi_test_xyz789",
		customer_email: "jane.doe@example.com",
		metadata: {
			pendingAppointmentId: "pending-apt-001",
			serviceId: "small",
		},
		url: "https://checkout.stripe.com/test-session",
		mode: "payment",
		status: "complete",
		...overrides,
	} as Stripe.Checkout.Session;
}

/**
 * Mock Stripe Charge for refund events
 */
export function createMockCharge(overrides: Partial<Stripe.Charge> = {}): Stripe.Charge {
	return {
		id: "ch_test_charge123",
		object: "charge",
		payment_intent: "pi_test_xyz789",
		amount: 5000,
		currency: "pln",
		status: "succeeded",
		refunded: true,
		...overrides,
	} as Stripe.Charge;
}

/**
 * Mock Stripe Event factory
 */
export function createMockStripeEvent(type: string, data: Stripe.Checkout.Session | Stripe.Charge): Stripe.Event {
	return {
		id: "evt_test_event123",
		object: "event",
		type,
		data: {
			object: data,
		},
		created: Math.floor(Date.now() / 1000),
		livemode: false,
		pending_webhooks: 0,
		request: null,
		api_version: "2025-12-15.clover",
	} as Stripe.Event;
}

/**
 * Creates a mock Stripe client for testing
 */
export function createMockStripeClient() {
	return {
		checkout: {
			sessions: {
				create: vi.fn().mockResolvedValue(createMockCheckoutSession()),
			},
		},
		webhooks: {
			constructEvent: vi.fn().mockImplementation((_payload, _sig, _secret) => {
				// Default to checkout.session.completed event
				return createMockStripeEvent("checkout.session.completed", createMockCheckoutSession());
			}),
		},
	};
}

/**
 * Mock the stripe-client module
 */
export function mockStripeClient() {
	const mockClient = createMockStripeClient();

	vi.mock("../../payments/stripe-client.js", () => ({
		getStripeClient: vi.fn(() => mockClient),
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
		DEPOSIT_AMOUNTS_GROSZE: {
			consultation: 0,
			small: 5000,
			medium: 10000,
			large: 15000,
			"extra-large": 20000,
		},
	}));

	return mockClient;
}
