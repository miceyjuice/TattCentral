/**
 * Payment status for appointments
 */
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

/**
 * Deposit amounts in PLN for each service type
 * Consultation is free, tattoos require a deposit
 */
export const DEPOSIT_AMOUNTS: Record<string, number> = {
	consultation: 0,
	small: 50,
	medium: 100,
	large: 150,
	"extra-large": 200,
};

/**
 * Get the deposit amount for a service
 * Returns 0 for unknown services (treat as consultation)
 */
export function getDepositAmount(serviceId: string): number {
	return DEPOSIT_AMOUNTS[serviceId] ?? 0;
}

/**
 * Check if a service requires payment
 */
export function requiresPayment(serviceId: string): boolean {
	return getDepositAmount(serviceId) > 0;
}

/**
 * Request data for creating a checkout session
 */
export interface CreateCheckoutRequest {
	appointmentData: {
		artistId: string;
		artistName: string;
		clientName: string;
		clientEmail: string;
		clientPhone?: string;
		description?: string;
		type: string;
		startTime: string; // ISO string
		endTime: string; // ISO string
		referenceImageUrls?: string[];
		referenceImagePaths?: string[];
	};
	serviceId: string;
	successUrl: string;
	cancelUrl: string;
}

/**
 * Response from creating a checkout session
 */
export interface CreateCheckoutResponse {
	sessionId: string;
	sessionUrl: string;
}

/**
 * Response when no payment is required (consultation)
 */
export interface NoPaymentRequiredResponse {
	noPaymentRequired: true;
	appointmentId: string;
}

/**
 * Combined response type
 */
export type CheckoutResponse = CreateCheckoutResponse | NoPaymentRequiredResponse;

/**
 * Type guard to check if payment was required
 */
export function isNoPaymentRequired(response: CheckoutResponse): response is NoPaymentRequiredResponse {
	return "noPaymentRequired" in response && response.noPaymentRequired === true;
}
