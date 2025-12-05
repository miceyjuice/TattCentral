/**
 * Appointment status types matching Firestore data
 */
export type AppointmentStatus = "pending" | "upcoming" | "completed" | "cancelled" | "declined";

/**
 * Appointment data from Firestore
 */
export interface AppointmentData {
	id: string;
	artistId: string;
	artistName: string;
	clientId: string;
	clientName: string;
	clientEmail: string;
	clientPhone: string;
	description: string;
	type: string;
	startTime: FirebaseFirestore.Timestamp;
	endTime: FirebaseFirestore.Timestamp;
	status: AppointmentStatus;
	imageUrl?: string;
	referenceImageUrls?: string[];
	referenceImagePaths?: string[];
	createdAt: FirebaseFirestore.Timestamp;
	updatedAt: FirebaseFirestore.Timestamp;
}

/**
 * Email template data for appointment emails
 */
export interface AppointmentEmailData {
	clientName: string;
	clientEmail: string;
	artistName: string;
	serviceType: string;
	date: string; // Formatted date string
	time: string; // Formatted time string
	duration: string; // e.g., "60 minutes"
	appointmentId: string;
}
