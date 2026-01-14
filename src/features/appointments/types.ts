import type { Timestamp } from "firebase/firestore";
import type { PaymentStatus } from "@/features/payments";

export type AppointmentDocument = {
	id?: string;
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
	referenceImagePaths?: string[]; // Storage paths for deletion
	cancellationToken?: string; // Secure token for client self-cancellation
	rating?: number;
	// Payment fields
	paymentStatus?: PaymentStatus;
	paymentIntentId?: string; // Stripe PaymentIntent ID
	depositAmount?: number; // Amount in PLN
	stripeSessionId?: string; // Checkout session ID
	paidAt?: Timestamp;
	refundedAt?: Timestamp;
};

export type UpcomingAppointment = {
	id: string;
	title: string;
	type: string;
	dateRange: string;
	image: string;
	status: "upcoming" | "pending";
};

export type PastAppointment = {
	id: string;
	date: string;
	title: string;
	type: string;
	rating: string;
	action: string;
};

export type AppointmentsResponse = {
	upcoming: UpcomingAppointment[];
	past: PastAppointment[];
};

/**
 * Full appointment details for the detail sheet/view.
 * Contains all fields needed to display complete appointment information.
 */
export type AppointmentDetail = {
	id: string;
	artistId: string;
	clientName: string;
	clientEmail?: string;
	clientPhone?: string;
	description?: string;
	type: string;
	status: "upcoming" | "completed" | "cancelled" | "pending";
	artistName: string;
	startTime: Date;
	endTime: Date;
	referenceImageUrls?: string[];
	// Payment fields
	paymentStatus?: PaymentStatus;
	depositAmount?: number;
	paidAt?: Date;
	refundedAt?: Date;
};
