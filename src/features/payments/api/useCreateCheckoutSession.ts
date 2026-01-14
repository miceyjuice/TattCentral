import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCheckoutSession } from "./createCheckoutSession";
import type { CreateCheckoutRequest } from "../types";

/**
 * React Query mutation hook for creating a checkout session
 */
export function useCreateCheckoutSession() {
	return useMutation({
		mutationFn: (request: CreateCheckoutRequest) => createCheckoutSession(request),
		onError: (error) => {
			console.error("Checkout session creation failed:", error);
			toast.error("Payment setup failed", {
				description: "Please try again or contact support.",
			});
		},
	});
}
