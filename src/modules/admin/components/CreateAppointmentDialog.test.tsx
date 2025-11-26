import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CreateAppointmentDialog } from "./CreateAppointmentDialog";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { addDoc } from "firebase/firestore";
import { toast } from "sonner";

// Mocks
vi.mock("@/context/AuthContext", () => ({
	useAuth: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
	useQueryClient: vi.fn(),
}));

vi.mock("firebase/firestore", async () => {
	const actual = await vi.importActual("firebase/firestore");
	return {
		...actual,
		addDoc: vi.fn(),
		collection: vi.fn(),
		Timestamp: {
			fromDate: (date: Date) => ({ toDate: () => date, seconds: Math.floor(date.getTime() / 1000) }),
		},
	};
});

vi.mock("@/lib/firebase", () => ({
	db: {},
}));

vi.mock("sonner", () => ({
	toast: vi.fn(),
}));

// Mock UI components that might be tricky
// We'll keep the real Dialog and Form components as they are essential for the flow,
// but we might need to mock the Calendar if it proves difficult.
// For now, let's try with the real Calendar.

describe("CreateAppointmentDialog", () => {
	const mockInvalidateQueries = vi.fn();
	const mockUser = { uid: "artist-123" };
	const mockUserProfile = { firstName: "Test", lastName: "Artist", role: "artist" };

	beforeEach(() => {
		vi.clearAllMocks();
		(useAuth as Mock).mockReturnValue({
			user: mockUser,
			userProfile: mockUserProfile,
		});
		(useQueryClient as Mock).mockReturnValue({
			invalidateQueries: mockInvalidateQueries,
		});
	});

	it("renders the trigger button", () => {
		render(<CreateAppointmentDialog />);
		expect(screen.getByRole("button", { name: /new appointment/i })).toBeInTheDocument();
	});

	it("opens dialog when trigger is clicked", async () => {
		const user = userEvent.setup();
		render(<CreateAppointmentDialog />);

		await user.click(screen.getByRole("button", { name: /new appointment/i }));

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Add New Appointment")).toBeInTheDocument();
	});

	it("shows validation errors for empty submission", async () => {
		const user = userEvent.setup();
		render(<CreateAppointmentDialog />);

		// Open dialog
		await user.click(screen.getByRole("button", { name: /new appointment/i }));

		// Submit without filling anything
		await user.click(screen.getByRole("button", { name: /create booking/i }));

		await waitFor(() => {
			expect(screen.getByText("Client name must be at least 2 characters.")).toBeInTheDocument();
			expect(screen.getByText("A date of appointment is required.")).toBeInTheDocument();
		});
	});

	it("shows error for short client name", async () => {
		const user = userEvent.setup();
		render(<CreateAppointmentDialog />);

		await user.click(screen.getByRole("button", { name: /new appointment/i }));

		const nameInput = screen.getByLabelText(/client name/i);
		await user.type(nameInput, "A"); // Too short
		await user.click(screen.getByRole("button", { name: /create booking/i }));

		await waitFor(() => {
			expect(screen.getByText("Client name must be at least 2 characters.")).toBeInTheDocument();
		});
	});

	it("shows error for invalid time format", async () => {
		const user = userEvent.setup();
		render(<CreateAppointmentDialog />);

		await user.click(screen.getByRole("button", { name: /new appointment/i }));

		const timeInput = screen.getByLabelText(/time/i);
		await user.clear(timeInput);
		// We leave it empty, which should fail the regex validation for time format
		await user.click(screen.getByRole("button", { name: /create booking/i }));

		await waitFor(() => {
			expect(screen.getByText("Please enter a valid time (HH:MM).")).toBeInTheDocument();
		});
	});

	it("submits form with valid data", async () => {
		// Mock system date to a fixed value so the calendar always opens to a known month
		// We do this before render so the component initializes with this date
		vi.useFakeTimers({ toFake: ["Date"] });
		const fixedDate = new Date(2024, 5, 10); // June 10, 2024
		vi.setSystemTime(fixedDate);

		const user = userEvent.setup();
		render(<CreateAppointmentDialog />);

		// Open dialog
		await user.click(screen.getByRole("button", { name: /new appointment/i }));

		// Fill Client Name
		await user.type(screen.getByLabelText(/client name/i), "Alice Wonderland");

		// Fill Time (default is 12:00, let's change it)
		const timeInput = screen.getByLabelText(/time/i);
		await user.clear(timeInput);
		await user.type(timeInput, "14:30");

		// Select Date
		// The button has the label "Date" associated with it via FormLabel, so we use that name
		await user.click(screen.getByRole("button", { name: "Date" }));

		// We need to wait for the calendar to appear
		await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

		// Pick a known day (e.g., 15th of the month)
		// We use regex to match "15" in the aria-label (e.g. "Saturday, June 15th, 2024")
		// and ensure we are picking the button for the day.
		const dayButton = screen.getByRole("button", { name: /15/ });
		await user.click(dayButton);

		// Submit
		await user.click(screen.getByRole("button", { name: /create booking/i }));

		await waitFor(() => {
			expect(addDoc).toHaveBeenCalledTimes(1);
		});

		// Restore system time after test
		vi.useRealTimers();

		// Verify addDoc arguments
		const callArgs = (addDoc as Mock).mock.calls[0];
		const data = callArgs[1];

		expect(data).toMatchObject({
			artistId: "artist-123",
			artistName: "Test Artist",
			clientName: "Alice Wonderland",
			status: "upcoming",
		});

		// Verify time parsing
		// We can't easily check the exact timestamp without knowing exactly which day was clicked,
		// but we can check that startTime and endTime are Timestamps (mocked objects)
		expect(data.startTime).toBeDefined();
		expect(data.endTime).toBeDefined();

		// Verify toast and query invalidation
		expect(toast).toHaveBeenCalledWith("Appointment created", expect.any(Object));
		expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["appointments"] });
	});
});
