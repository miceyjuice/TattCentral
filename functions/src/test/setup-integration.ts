/**
 * Integration test setup for Firebase Functions
 *
 * Uses firebase-functions-test in offline mode for fast, reliable tests
 * without requiring a Firebase project connection.
 */

import functionsTest from "firebase-functions-test";

/**
 * Initialize firebase-functions-test in offline mode
 * No project configuration needed - we mock all Firebase interactions
 */
export const testEnv = functionsTest();

/**
 * Cleanup function to be called in afterAll()
 * Resets the test environment and clears any state
 */
export function cleanup(): void {
	testEnv.cleanup();
}

/**
 * Creates a mock Firestore Timestamp for testing
 * Mimics the Firebase Admin SDK Timestamp interface
 */
export function createMockTimestamp(date: Date): FirebaseFirestore.Timestamp {
	return {
		toDate: () => date,
		toMillis: () => date.getTime(),
		seconds: Math.floor(date.getTime() / 1000),
		nanoseconds: (date.getTime() % 1000) * 1000000,
		isEqual: (other: FirebaseFirestore.Timestamp) => other.toMillis() === date.getTime(),
		valueOf: () => date.toISOString(),
	} as FirebaseFirestore.Timestamp;
}

/**
 * Creates mock snapshot data for onCreate triggers
 */
export function createDocumentSnapshot<T extends Record<string, unknown>>(
	data: T,
	path: string,
): {
	data: () => T;
	id: string;
	ref: { path: string };
} {
	const pathParts = path.split("/");
	const id = pathParts[pathParts.length - 1];

	return {
		data: () => data,
		id,
		ref: { path },
	};
}

/**
 * Creates mock event data for Firestore triggers
 */
export function createFirestoreEvent<T extends Record<string, unknown>>(
	data: T,
	documentPath: string,
): {
	data: ReturnType<typeof createDocumentSnapshot<T>>;
	params: Record<string, string>;
} {
	const pathParts = documentPath.split("/");
	const params: Record<string, string> = {};

	// Extract path parameters (e.g., appointmentId from appointments/{appointmentId})
	for (let i = 1; i < pathParts.length; i += 2) {
		const paramName = pathParts[i - 1].includes("{")
			? pathParts[i - 1].replace(/[{}]/g, "")
			: `param${Math.floor(i / 2)}`;
		params[paramName === "appointments" ? "appointmentId" : paramName] = pathParts[i];
	}

	return {
		data: createDocumentSnapshot(data, documentPath),
		params,
	};
}

/**
 * Creates mock before/after data for onUpdate triggers
 */
export function createUpdateEvent<T extends Record<string, unknown>>(
	before: T,
	after: T,
	documentPath: string,
): {
	data: {
		before: ReturnType<typeof createDocumentSnapshot<T>>;
		after: ReturnType<typeof createDocumentSnapshot<T>>;
	};
	params: Record<string, string>;
} {
	const pathParts = documentPath.split("/");
	const params: Record<string, string> = {};

	// Extract appointmentId from path
	if (pathParts[0] === "appointments" && pathParts[1]) {
		params.appointmentId = pathParts[1];
	}

	return {
		data: {
			before: createDocumentSnapshot(before, documentPath),
			after: createDocumentSnapshot(after, documentPath),
		},
		params,
	};
}
