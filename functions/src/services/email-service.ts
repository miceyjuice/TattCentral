import { Resend } from "resend";
import * as logger from "firebase-functions/logger";
import { defineString } from "firebase-functions/params";

// Define the API key as a Firebase parameter (set via firebase functions:secrets:set)
const resendApiKey = defineString("RESEND_API_KEY");

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
	if (!resendClient) {
		const apiKey = resendApiKey.value();
		if (!apiKey) {
			throw new Error("RESEND_API_KEY is not configured");
		}
		resendClient = new Resend(apiKey);
	}
	return resendClient;
}

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	replyTo?: string;
}

export interface EmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * Sends an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
	try {
		const resend = getResendClient();

		const { data, error } = await resend.emails.send({
			from: "TattCentral <onboarding@resend.dev>", // Using Resend's default domain
			to: options.to,
			subject: options.subject,
			html: options.html,
			replyTo: options.replyTo,
		});

		if (error) {
			logger.error("Failed to send email", { error, to: options.to });
			return {
				success: false,
				error: error.message,
			};
		}

		logger.info("Email sent successfully", {
			messageId: data?.id,
			to: options.to,
			subject: options.subject,
		});

		return {
			success: true,
			messageId: data?.id,
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "Unknown error";
		logger.error("Email sending threw an exception", { error: errorMessage, to: options.to });
		return {
			success: false,
			error: errorMessage,
		};
	}
}
