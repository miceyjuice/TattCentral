import { AppointmentEmailData } from "../types";

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param unsafe - The potentially unsafe string to escape
 * @returns HTML-safe string
 */
export function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Sanitizes all user-provided fields in email data
 */
function sanitizeEmailData(data: AppointmentEmailData): AppointmentEmailData {
	return {
		...data,
		clientName: escapeHtml(data.clientName),
		clientEmail: escapeHtml(data.clientEmail),
		artistName: escapeHtml(data.artistName),
		serviceType: escapeHtml(data.serviceType),
		date: escapeHtml(data.date),
		time: escapeHtml(data.time),
		duration: escapeHtml(data.duration),
	};
}

/**
 * Common email styles
 */
const styles = {
	container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #0a0a0a;
    color: #ffffff;
  `,
	header: `
    background-color: #1a1a1a;
    padding: 24px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  `,
	logo: `
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 0.05em;
  `,
	content: `
    padding: 32px 24px;
  `,
	title: `
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 16px 0;
    color: #ffffff;
  `,
	subtitle: `
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 24px 0;
  `,
	detailsBox: `
    background-color: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
  `,
	detailsTitle: `
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.4);
    margin: 0 0 16px 0;
  `,
	detailRow: `
    display: flex;
    margin-bottom: 12px;
  `,
	detailLabel: `
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    min-width: 80px;
  `,
	detailValue: `
    font-size: 14px;
    color: #ffffff;
  `,
	statusBadge: (color: string) => `
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${color}20;
    color: ${color};
  `,
	button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #ffffff;
    color: #000000;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    margin: 8px 4px 8px 0;
  `,
	buttonOutline: `
    display: inline-block;
    padding: 12px 24px;
    background-color: transparent;
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin: 8px 4px 8px 0;
  `,
	footer: `
    background-color: #1a1a1a;
    padding: 24px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  `,
	footerText: `
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
  `,
	noticeBox: (borderColor: string, bgColor: string) => `
    border: 1px solid ${borderColor};
    background-color: ${bgColor};
    border-radius: 8px;
    padding: 16px;
    margin: 24px 0;
  `,
	noticeTitle: (color: string) => `
    font-weight: 500;
    color: ${color};
    margin: 0 0 8px 0;
  `,
	noticeText: (color: string) => `
    font-size: 14px;
    color: ${color};
    margin: 0;
    opacity: 0.8;
  `,
};

/**
 * Generates the appointment details HTML block
 */
function appointmentDetailsHtml(data: AppointmentEmailData): string {
	const safe = sanitizeEmailData(data);
	return `
    <div style="${styles.detailsBox}" role="region" aria-label="Appointment Details">
      <p style="${styles.detailsTitle}">Appointment Details</p>
      <table style="width: 100%; border-collapse: collapse;" role="presentation">
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Service</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${safe.serviceType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Artist</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${safe.artistName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Date</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${safe.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Time</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${safe.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Duration</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${safe.duration}</td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Email header with logo
 */
function headerHtml(): string {
	return `
    <div style="${styles.header}">
      <span style="${styles.logo}">TattCentral</span>
    </div>
  `;
}

/**
 * Email footer
 */
function footerHtml(): string {
	return `
    <div style="${styles.footer}">
      <p style="${styles.footerText}">
        TattCentral Studio<br>
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  `;
}

/**
 * Generates the cancellation link section for emails
 */
function cancellationLinkHtml(cancellationUrl: string | undefined, isPending: boolean): string {
	if (!cancellationUrl) return "";

	const linkText = isPending ? "Cancel Request" : "Cancel Appointment";

	return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
      <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin: 0 0 8px 0;">
        Need to cancel? You can do so up to 24 hours before your appointment.
      </p>
      <a href="${escapeHtml(cancellationUrl)}" style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-decoration: underline;" target="_blank" rel="noopener noreferrer">${linkText}</a>
    </div>
  `;
}

/**
 * Booking confirmation email (pending status)
 */
export function bookingConfirmationHtml(data: AppointmentEmailData): string {
	const safeData = sanitizeEmailData(data);
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="${styles.container}">
        ${headerHtml()}
        <div style="${styles.content}">
          <h1 style="${styles.title}">Booking Request Received!</h1>
          <p style="${styles.subtitle}">Hi ${safeData.clientName}, thank you for your booking request.</p>
          
          <div style="${styles.noticeBox("rgba(234, 179, 8, 0.3)", "rgba(234, 179, 8, 0.1)")}">
            <p style="${styles.noticeTitle("#fef08a")}">Pending Approval</p>
            <p style="${styles.noticeText("#fef08a")}">
              Your appointment is awaiting confirmation from our team. 
              We'll send you another email once it's approved.
            </p>
          </div>
          
          ${appointmentDetailsHtml(safeData)}
          
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 24px;">
            If you have any questions, feel free to contact us.
          </p>
          
          ${cancellationLinkHtml(data.cancellationUrl, true)}
        </div>
        ${footerHtml()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Appointment approved email
 */
export function appointmentApprovedHtml(data: AppointmentEmailData): string {
	const safeData = sanitizeEmailData(data);
	// Generate Add to Calendar URLs (use original data for URLs as they need raw dates)
	const googleCalendarUrl = generateGoogleCalendarUrl(data);
	const outlookCalendarUrl = generateOutlookCalendarUrl(data);

	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="${styles.container}">
        ${headerHtml()}
        <div style="${styles.content}">
          <h1 style="${styles.title}">Your Appointment is Confirmed! ✓</h1>
          <p style="${styles.subtitle}">Hi ${safeData.clientName}, great news! Your appointment has been approved.</p>
          
          <div style="${styles.noticeBox("rgba(34, 197, 94, 0.3)", "rgba(34, 197, 94, 0.1)")}">
            <p style="${styles.noticeTitle("#86efac")}">Confirmed</p>
            <p style="${styles.noticeText("#86efac")}">
              Your appointment is confirmed. We look forward to seeing you!
            </p>
          </div>
          
          ${appointmentDetailsHtml(safeData)}
          
          <p style="color: #ffffff; font-size: 14px; margin: 24px 0 16px 0;">Add to your calendar:</p>
          <div role="group" aria-label="Calendar options">
            <a href="${googleCalendarUrl}" style="${styles.buttonOutline}" target="_blank" rel="noopener noreferrer" aria-label="Add to Google Calendar">Google Calendar</a>
            <a href="${outlookCalendarUrl}" style="${styles.buttonOutline}" target="_blank" rel="noopener noreferrer" aria-label="Add to Outlook Calendar">Outlook</a>
          </div>
          
          ${cancellationLinkHtml(data.cancellationUrl, false)}
        </div>
        ${footerHtml()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Appointment declined email
 */
export function appointmentDeclinedHtml(data: AppointmentEmailData): string {
	const safeData = sanitizeEmailData(data);
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="${styles.container}">
        ${headerHtml()}
        <div style="${styles.content}">
          <h1 style="${styles.title}">Booking Update</h1>
          <p style="${styles.subtitle}">Hi ${safeData.clientName}, we have an update about your booking request.</p>
          
          <div style="${styles.noticeBox("rgba(239, 68, 68, 0.3)", "rgba(239, 68, 68, 0.1)")}">
            <p style="${styles.noticeTitle("#fca5a5")}">Unable to Accommodate</p>
            <p style="${styles.noticeText("#fca5a5")}">
              Unfortunately, we're unable to accommodate your requested appointment time.
              We apologize for any inconvenience.
            </p>
          </div>
          
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-bottom: 8px;">Original request:</p>
          ${appointmentDetailsHtml(safeData)}
          
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 24px;">
            We'd love to find a time that works for you. Please feel free to book another appointment
            or contact us if you have any questions.
          </p>
        </div>
        ${footerHtml()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Appointment cancelled email
 */
export function appointmentCancelledHtml(data: AppointmentEmailData): string {
	const safe = sanitizeEmailData(data);
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="${styles.container}">
        ${headerHtml()}
        <div style="${styles.content}">
          <h1 style="${styles.title}">Appointment Cancelled</h1>
          <p style="${styles.subtitle}">Hi ${safe.clientName}, your appointment has been cancelled.</p>
          
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-bottom: 8px;">Cancelled appointment:</p>
          ${appointmentDetailsHtml(data)}
          
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-top: 24px;">
            If you'd like to book a new appointment, please visit our booking page.
            We hope to see you soon!
          </p>
        </div>
        ${footerHtml()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Appointment rescheduled email
 */
export function appointmentRescheduledHtml(
	data: AppointmentEmailData,
	oldData: { date: string; time: string },
): string {
	const safe = sanitizeEmailData(data);
	const safeOld = {
		date: escapeHtml(oldData.date),
		time: escapeHtml(oldData.time),
	};
	const googleCalendarUrl = generateGoogleCalendarUrl(data);
	const outlookCalendarUrl = generateOutlookCalendarUrl(data);

	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a;">
      <div style="${styles.container}">
        ${headerHtml()}
        <div style="${styles.content}">
          <h1 style="${styles.title}">Appointment Rescheduled</h1>
          <p style="${styles.subtitle}">Hi ${safe.clientName}, your appointment has been rescheduled.</p>
          
          <div style="${styles.noticeBox("rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.1)")}">
            <p style="${styles.noticeTitle("#93c5fd")}">New Date & Time</p>
            <p style="${styles.noticeText("#93c5fd")}">
              <strong>${safe.date}</strong> at <strong>${safe.time}</strong>
            </p>
          </div>
          
          <div style="${styles.detailsBox}" role="region" aria-label="Schedule Change">
            <p style="${styles.detailsTitle}">Schedule Change</p>
            <table style="width: 100%; border-collapse: collapse;" role="presentation">
              <tr>
                <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;"></td>
                <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center;">OLD</td>
                <td style="padding: 8px 0; color: #ffffff; font-size: 12px; text-align: center;">NEW</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Date</td>
                <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.4); font-size: 14px; text-align: center; text-decoration: line-through;">${safeOld.date}</td>
                <td style="padding: 8px 0; color: #22c55e; font-size: 14px; text-align: center; font-weight: 500;">${safe.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Time</td>
                <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.4); font-size: 14px; text-align: center; text-decoration: line-through;">${safeOld.time}</td>
                <td style="padding: 8px 0; color: #22c55e; font-size: 14px; text-align: center; font-weight: 500;">${safe.time}</td>
              </tr>
            </table>
          </div>
          
          ${appointmentDetailsHtml(data)}
          
          <p style="color: #ffffff; font-size: 14px; margin: 24px 0 16px 0;">Update your calendar:</p>
          <div role="group" aria-label="Calendar options">
            <a href="${googleCalendarUrl}" style="${styles.buttonOutline}" target="_blank" rel="noopener noreferrer" aria-label="Add to Google Calendar">Google Calendar</a>
            <a href="${outlookCalendarUrl}" style="${styles.buttonOutline}" target="_blank" rel="noopener noreferrer" aria-label="Add to Outlook Calendar">Outlook</a>
          </div>
          
          ${cancellationLinkHtml(data.cancellationUrl, false)}
        </div>
        ${footerHtml()}
      </div>
    </body>
    </html>
  `;
}

/**
 * Formats a Date to Google Calendar format: YYYYMMDDTHHMMSSZ
 * Converts ISO string (2024-01-15T14:00:00.000Z) to (20240115T140000Z)
 */
function formatDateForCalendar(date: Date): string {
	return date
		.toISOString()
		.replace(/[-:]/g, "") // Remove dashes and colons
		.replace(/\.\d{3}Z$/, "Z"); // Remove milliseconds, keep Z
}

/**
 * Generates a Google Calendar URL
 */
function generateGoogleCalendarUrl(data: AppointmentEmailData): string {
	const title = encodeURIComponent(`${data.serviceType} - TattCentral`);
	const details = encodeURIComponent(`Artist: ${data.artistName}\nService: ${data.serviceType}`);
	const location = encodeURIComponent("TattCentral Studio");
	const startDate = formatDateForCalendar(data.startTime);
	const endDate = formatDateForCalendar(data.endTime);

	return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
}

/**
 * Generates an Outlook Calendar URL
 */
function generateOutlookCalendarUrl(data: AppointmentEmailData): string {
	const subject = encodeURIComponent(`${data.serviceType} - TattCentral`);
	const body = encodeURIComponent(`Artist: ${data.artistName}\nService: ${data.serviceType}`);
	const location = encodeURIComponent("TattCentral Studio");
	const startDate = data.startTime.toISOString();
	const endDate = data.endTime.toISOString();

	return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&body=${body}&location=${location}&startdt=${startDate}&enddt=${endDate}`;
}
