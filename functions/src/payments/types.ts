/**
 * Shared types for payment Cloud Functions
 */

import type { Timestamp } from "firebase-admin/firestore";

/**
 * Payment status for appointments
 */
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

/**
 * Appointment data received from client for checkout
 */
export interface AppointmentDataInput {
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
}

/**
 * Request data for creating a checkout session
 */
export interface CreateCheckoutRequest {
	appointmentData: AppointmentDataInput;
	serviceId: string;
	successUrl: string;
	cancelUrl: string;
}

/**
 * Appointment document structure in Firestore
 */
export interface AppointmentDocument {
	artistId: string;
	clientId: string;
	artistName: string;
	clientName: string;
	clientEmail?: string;
	clientPhone?: string;
	description?: string;
	type: string;
	startTime: Timestamp;
	endTime: Timestamp;
	status: "upcoming" | "completed" | "cancelled" | "pending";
	imageUrl: string;
	referenceImageUrls?: string[];
	referenceImagePaths?: string[];
	cancellationToken?: string;
	// Payment fields
	paymentStatus?: PaymentStatus;
	paymentIntentId?: string;
	depositAmount?: number;
	stripeSessionId?: string;
	paidAt?: Timestamp;
	refundedAt?: Timestamp;
}
