import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BookingConfirmation } from "./BookingConfirmation";

// Mock window.open
const mockWindowOpen = vi.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();

const mockState = {
	appointmentId: "test-appointment-123",
	clientName: "Anna Kowalska",
	clientEmail: "anna@example.com",
	artistName: "Jan Nowak",
	serviceLabel: "Small Tattoo",
	startTime: "2025-12-15T10:00:00",
	endTime: "2025-12-15T11:00:00",
};

function renderWithState(state: typeof mockState | null) {
	return render(
		<MemoryRouter initialEntries={[{ pathname: "/booking/confirmation", state }]}>
			<Routes>
				<Route path="/booking/confirmation" element={<BookingConfirmation />} />
				<Route path="/booking" element={<div>Booking Page</div>} />
				<Route path="/" element={<div>Home Page</div>} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("BookingConfirmation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("open", mockWindowOpen);
		URL.createObjectURL = mockCreateObjectURL;
		URL.revokeObjectURL = mockRevokeObjectURL;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("rendering", () => {
		it("displays success message", () => {
			renderWithState(mockState);

			expect(screen.getByText("Booking Request Sent!")).toBeInTheDocument();
			expect(screen.getByText(/Your appointment is pending approval/)).toBeInTheDocument();
		});

		it("displays client name in appointment details", () => {
			renderWithState(mockState);

			expect(screen.getByText("Anna Kowalska")).toBeInTheDocument();
		});

		it("displays artist name in appointment details", () => {
			renderWithState(mockState);

			expect(screen.getByText("Jan Nowak")).toBeInTheDocument();
		});

		it("displays formatted date", () => {
			renderWithState(mockState);

			expect(screen.getByText("Monday, 15 December 2025")).toBeInTheDocument();
		});

		it("displays formatted time with duration", () => {
			renderWithState(mockState);

			expect(screen.getByText("10:00 - 11:00 (60m)")).toBeInTheDocument();
		});

		it("displays service label", () => {
			renderWithState(mockState);

			expect(screen.getByText("Small Tattoo")).toBeInTheDocument();
		});

		it("displays email notice with client email", () => {
			renderWithState(mockState);

			expect(screen.getByText("Check your email")).toBeInTheDocument();
			expect(screen.getByText("anna@example.com")).toBeInTheDocument();
		});

		it("displays add to calendar section", () => {
			renderWithState(mockState);

			expect(screen.getByText("Add to Calendar")).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /Google Calendar/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /Outlook/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /Apple Calendar/i })).toBeInTheDocument();
		});

		it("displays back to home button", () => {
			renderWithState(mockState);

			expect(screen.getByRole("button", { name: /Back to Home/i })).toBeInTheDocument();
		});
	});

	describe("calendar buttons", () => {
		it("opens Google Calendar URL when clicking Google Calendar button", async () => {
			const user = userEvent.setup();
			renderWithState(mockState);

			await user.click(screen.getByRole("button", { name: /Google Calendar/i }));

			expect(mockWindowOpen).toHaveBeenCalledTimes(1);
			expect(mockWindowOpen).toHaveBeenCalledWith(
				expect.stringContaining("calendar.google.com"),
				"_blank",
				"noopener,noreferrer",
			);
		});

		it("opens Outlook URL when clicking Outlook button", async () => {
			const user = userEvent.setup();
			renderWithState(mockState);

			await user.click(screen.getByRole("button", { name: /Outlook/i }));

			expect(mockWindowOpen).toHaveBeenCalledTimes(1);
			expect(mockWindowOpen).toHaveBeenCalledWith(
				expect.stringContaining("outlook.live.com"),
				"_blank",
				"noopener,noreferrer",
			);
		});

		it("creates blob URL when clicking Apple Calendar button", async () => {
			const user = userEvent.setup();
			renderWithState(mockState);

			await user.click(screen.getByRole("button", { name: /Apple Calendar/i }));

			expect(mockCreateObjectURL).toHaveBeenCalled();
			expect(mockRevokeObjectURL).toHaveBeenCalled();
		});
	});

	describe("navigation", () => {
		it("redirects to booking page when no state is provided", () => {
			renderWithState(null);

			expect(screen.getByText("Booking Page")).toBeInTheDocument();
		});

		it("navigates to home when clicking Back to Home button", async () => {
			const user = userEvent.setup();
			renderWithState(mockState);

			await user.click(screen.getByRole("button", { name: /Back to Home/i }));

			expect(screen.getByText("Home Page")).toBeInTheDocument();
		});
	});

	describe("Google Calendar URL generation", () => {
		it("includes appointment details in Google Calendar URL", async () => {
			const user = userEvent.setup();
			renderWithState(mockState);

			await user.click(screen.getByRole("button", { name: /Google Calendar/i }));

			const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
			expect(calledUrl).toContain("Small+Tattoo");
			expect(calledUrl).toContain("TattCentral");
			expect(calledUrl).toContain("Jan+Nowak");
		});

		it("includes timezone parameter in Google Calendar URL", async () => {
			const user = userEvent.setup();
			renderWithState(mockState);

			await user.click(screen.getByRole("button", { name: /Google Calendar/i }));

			const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
			expect(calledUrl).toContain("ctz=Europe%2FWarsaw");
		});
	});

	describe("edge cases", () => {
		it("handles popup blocker gracefully when window.open returns null", async () => {
			mockWindowOpen.mockReturnValueOnce(null);
			const user = userEvent.setup();
			renderWithState(mockState);

			// Should not throw when popup is blocked
			await expect(user.click(screen.getByRole("button", { name: /Google Calendar/i }))).resolves.not.toThrow();

			expect(mockWindowOpen).toHaveBeenCalledTimes(1);
		});

		it("throws error for invalid date strings", () => {
			const invalidState = {
				...mockState,
				startTime: "invalid-date",
				endTime: "also-invalid",
			};

			// date-fns format() throws RangeError for invalid dates
			// This documents current behavior - invalid dates should be prevented
			// at the source (BookingRoute) rather than handled here
			expect(() => renderWithState(invalidState)).toThrow("Invalid time value");
		});

		it("still calls download function when ICS button is clicked", async () => {
			const user = userEvent.setup();
			renderWithState(mockState);

			// The download function creates a blob and triggers download
			// We verify the blob URL was created
			await user.click(screen.getByRole("button", { name: /Apple Calendar/i }));

			expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
			expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
		});
	});
});
