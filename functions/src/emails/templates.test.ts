import { describe, it, expect } from "vitest";
import {
	bookingConfirmationHtml,
	appointmentApprovedHtml,
	appointmentDeclinedHtml,
	appointmentCancelledHtml,
	appointmentRescheduledHtml,
	escapeHtml,
} from "./templates";
import { AppointmentEmailData } from "../types";

const mockEmailData: AppointmentEmailData = {
	appointmentId: "test-123",
	clientName: "John Doe",
	clientEmail: "john@example.com",
	artistName: "Jane Artist",
	serviceType: "Large Tattoo",
	date: "Monday, January 15, 2024",
	time: "14:00",
	duration: "3 hours",
	startTime: new Date("2024-01-15T14:00:00Z"),
	endTime: new Date("2024-01-15T17:00:00Z"),
};

describe("bookingConfirmationHtml", () => {
	it("generates valid HTML with client name", () => {
		const html = bookingConfirmationHtml(mockEmailData);

		expect(html).toContain("John Doe");
		expect(html).toContain("Booking Request Received");
		expect(html).toContain("Pending Approval");
	});

	it("includes appointment details", () => {
		const html = bookingConfirmationHtml(mockEmailData);

		expect(html).toContain("Large Tattoo");
		expect(html).toContain("Jane Artist");
		expect(html).toContain("Monday, January 15, 2024");
		expect(html).toContain("14:00");
		expect(html).toContain("3 hours");
	});

	it("includes proper HTML structure", () => {
		const html = bookingConfirmationHtml(mockEmailData);

		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<html>");
		expect(html).toContain("</html>");
		expect(html).toContain("TattCentral");
	});

	it("includes accessibility attributes", () => {
		const html = bookingConfirmationHtml(mockEmailData);

		expect(html).toContain('role="presentation"');
		expect(html).toContain('aria-label="Appointment Details"');
	});
});

describe("appointmentApprovedHtml", () => {
	it("generates valid HTML with confirmation message", () => {
		const html = appointmentApprovedHtml(mockEmailData);

		expect(html).toContain("John Doe");
		expect(html).toContain("Confirmed");
		expect(html).toContain("Your Appointment is Confirmed");
	});

	it("includes Google Calendar link with correct format", () => {
		const html = appointmentApprovedHtml(mockEmailData);

		expect(html).toContain("calendar.google.com/calendar/render");
		expect(html).toContain("action=TEMPLATE");
		expect(html).toContain("Large%20Tattoo");
	});

	it("includes Outlook Calendar link", () => {
		const html = appointmentApprovedHtml(mockEmailData);

		expect(html).toContain("outlook.live.com/calendar");
		expect(html).toContain("rru=addevent");
	});

	it("includes accessibility attributes for calendar links", () => {
		const html = appointmentApprovedHtml(mockEmailData);

		expect(html).toContain('aria-label="Add to Google Calendar"');
		expect(html).toContain('aria-label="Add to Outlook Calendar"');
		expect(html).toContain('rel="noopener noreferrer"');
	});
});

describe("appointmentDeclinedHtml", () => {
	it("generates valid HTML with decline message", () => {
		const html = appointmentDeclinedHtml(mockEmailData);

		expect(html).toContain("John Doe");
		expect(html).toContain("Unable to Accommodate");
		expect(html).toContain("Booking Update");
	});

	it("includes original request details", () => {
		const html = appointmentDeclinedHtml(mockEmailData);

		expect(html).toContain("Original request");
		expect(html).toContain("Large Tattoo");
	});
});

describe("appointmentCancelledHtml", () => {
	it("generates valid HTML with cancellation message", () => {
		const html = appointmentCancelledHtml(mockEmailData);

		expect(html).toContain("John Doe");
		expect(html).toContain("Appointment Cancelled");
		expect(html).toContain("Cancelled appointment");
	});
});

describe("appointmentRescheduledHtml", () => {
	const oldData = {
		date: "Friday, January 12, 2024",
		time: "10:00",
	};

	it("generates valid HTML with reschedule message", () => {
		const html = appointmentRescheduledHtml(mockEmailData, oldData);

		expect(html).toContain("John Doe");
		expect(html).toContain("Appointment Rescheduled");
		expect(html).toContain("New Date & Time");
	});

	it("shows old and new dates", () => {
		const html = appointmentRescheduledHtml(mockEmailData, oldData);

		// Old dates (struck through)
		expect(html).toContain("Friday, January 12, 2024");
		expect(html).toContain("10:00");

		// New dates
		expect(html).toContain("Monday, January 15, 2024");
		expect(html).toContain("14:00");
	});

	it("includes schedule change comparison table", () => {
		const html = appointmentRescheduledHtml(mockEmailData, oldData);

		expect(html).toContain("Schedule Change");
		expect(html).toContain("OLD");
		expect(html).toContain("NEW");
	});

	it("includes calendar links for new time", () => {
		const html = appointmentRescheduledHtml(mockEmailData, oldData);

		expect(html).toContain("Update your calendar");
		expect(html).toContain("calendar.google.com");
		expect(html).toContain("outlook.live.com");
	});

	it("includes accessibility attributes", () => {
		const html = appointmentRescheduledHtml(mockEmailData, oldData);

		expect(html).toContain('aria-label="Schedule Change"');
	});
});

describe("Calendar URL generation", () => {
	it("generates Google Calendar URL with correct date format", () => {
		const html = appointmentApprovedHtml(mockEmailData);

		// Check for YYYYMMDDTHHMMSSZ format
		expect(html).toMatch(/dates=\d{8}T\d{6}Z\/\d{8}T\d{6}Z/);
	});

	it("generates Outlook Calendar URL with ISO date format", () => {
		const html = appointmentApprovedHtml(mockEmailData);

		// Check for ISO format dates
		expect(html).toContain("startdt=");
		expect(html).toContain("enddt=");
	});
});

describe("escapeHtml", () => {
	it("escapes HTML special characters", () => {
		expect(escapeHtml("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
	});

	it("escapes ampersands", () => {
		expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
	});

	it("escapes quotes", () => {
		expect(escapeHtml('He said "hello"')).toBe("He said &quot;hello&quot;");
	});

	it("handles empty strings", () => {
		expect(escapeHtml("")).toBe("");
	});

	it("preserves safe strings unchanged", () => {
		expect(escapeHtml("John Doe")).toBe("John Doe");
	});
});

describe("XSS protection in templates", () => {
	it("escapes malicious client names in booking confirmation", () => {
		const maliciousData: AppointmentEmailData = {
			...mockEmailData,
			clientName: "<script>alert('xss')</script>",
		};

		const html = bookingConfirmationHtml(maliciousData);

		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;");
	});

	it("escapes malicious service types in approved emails", () => {
		const maliciousData: AppointmentEmailData = {
			...mockEmailData,
			serviceType: '<img src=x onerror="alert(1)">',
		};

		const html = appointmentApprovedHtml(maliciousData);

		// Should not contain unescaped HTML tags
		expect(html).not.toContain('<img src=x onerror="alert(1)">');
		// Should contain escaped version (double-escaped due to helper functions: < → &lt; → &amp;lt;)
		expect(html).toContain("&amp;lt;");
		expect(html).toContain("&amp;gt;");
	});

	it("escapes malicious data in rescheduled emails", () => {
		const maliciousData: AppointmentEmailData = {
			...mockEmailData,
			artistName: '"><script>alert(1)</script>',
		};

		const html = appointmentRescheduledHtml(maliciousData, {
			date: "Old Date",
			time: "Old Time",
		});

		expect(html).not.toContain('"><script>');
		expect(html).toContain("&quot;&gt;&lt;script&gt;");
	});
});
