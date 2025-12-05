/**
 * Firebase Cloud Functions for TattCentral
 *
 * Email notification functions triggered by Firestore document changes
 */

import { setGlobalOptions } from "firebase-functions/v2";

// Set global options for all functions
setGlobalOptions({
	region: "europe-west1",
	maxInstances: 10,
});

// Export appointment triggers
export { onAppointmentCreated } from "./triggers/on-appointment-created";
export { onAppointmentUpdated } from "./triggers/on-appointment-updated";
