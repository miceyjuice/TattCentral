/**
 * Stripe client initialization for Cloud Functions
 */

import Stripe from "stripe";
import { defineString } from "firebase-functions/params";

// Define parameters for Stripe configuration
const stripeSecretKey = defineString("STRIPE_SECRET_KEY");

let stripeInstance: Stripe | null = null;

/**
 * Get or create the Stripe client instance
 * Lazily initialized to allow params to resolve at runtime
 */
export function getStripeClient(): Stripe {
	if (!stripeInstance) {
		stripeInstance = new Stripe(stripeSecretKey.value(), {
			apiVersion: "2025-12-15.clover",
		});
	}
	return stripeInstance;
}

/**
 * Deposit amounts in PLN (grosze) for each service type
 * Note: Stripe uses smallest currency unit (1 PLN = 100 groszy)
 */
export const DEPOSIT_AMOUNTS_GROSZE: Record<string, number> = {
	consultation: 0,
	small: 5000, // 50 PLN
	medium: 10000, // 100 PLN
	large: 15000, // 150 PLN
	"extra-large": 20000, // 200 PLN
};

/**
 * Get the deposit amount for a service in grosze
 */
export function getDepositAmountGrosze(serviceId: string): number {
	return DEPOSIT_AMOUNTS_GROSZE[serviceId] ?? 0;
}

/**
 * Check if a service requires payment
 */
export function requiresPayment(serviceId: string): boolean {
	return getDepositAmountGrosze(serviceId) > 0;
}
