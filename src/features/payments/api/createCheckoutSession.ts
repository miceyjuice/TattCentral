import { getFunctions, httpsCallable } from "firebase/functions";
import type { CreateCheckoutRequest, CheckoutResponse } from "../types";

/**
 * Calls the createCheckoutSession Cloud Function
 * Returns either a Stripe checkout session URL or indicates no payment needed
 */
export async function createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutResponse> {
	// Lazy initialization to avoid calling getFunctions before Firebase is initialized
	const functions = getFunctions(undefined, "europe-west1");
	const callable = httpsCallable<CreateCheckoutRequest, CheckoutResponse>(functions, "createCheckoutSession");

	const result = await callable(request);
	return result.data;
}
