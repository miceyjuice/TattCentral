import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type { CreateCheckoutRequest, CheckoutResponse } from "../types";

/**
 * Calls the createCheckoutSession Cloud Function
 * Returns either a Stripe checkout session URL or indicates no payment needed
 */
export async function createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutResponse> {
	const callable = httpsCallable<CreateCheckoutRequest, CheckoutResponse>(functions, "createCheckoutSession");

	const result = await callable(request);
	return result.data;
}
