/**
 * Firebase Cloud Functions for TattCentral
 *
 * Email notification functions triggered by Firestore document changes
 * Payment functions for Stripe integration
 * @version 3.0.0 - Added Stripe payment integration
 */

import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

// Initialize Firebase Admin SDK
initializeApp();

// Set global options for all functions
setGlobalOptions({
	region: "europe-west1",
	maxInstances: 10,
});

// Export appointment triggers
export { onAppointmentCreated } from "./triggers/on-appointment-created.js";
export { onAppointmentUpdated } from "./triggers/on-appointment-updated.js";

// Export payment functions
export { createCheckoutSession, stripeWebhook } from "./payments/index.js";
