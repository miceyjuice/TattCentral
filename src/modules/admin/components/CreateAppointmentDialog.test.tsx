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

	it("submits form with valid data", async () => {
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
		// The button's visible text is "Pick a date", so we match it directly.
		await user.click(screen.getByRole("button", { name: /pick a date/i }));

		// Select a day.
		// We'll try to find a day button. In DayPicker, days are usually buttons with role "gridcell" or just buttons.
		// Let's try to find a specific day number, e.g., "15" to be safe, or just the first available one.
		// We need to make sure we pick a future date because past dates are disabled.
		// The component has `disabled={(date) => date < new Date()}`.
		// So we should pick a date that is definitely in the future.
		// Since we can't easily control the "current date" of the test runner without system time mocking,
		// we'll assume the calendar opens to the current month.
		// We'll look for a day that is likely enabled (e.g. the 28th of the month, or we can mock system time).

		// Let's mock system time to be fixed so we know what "today" is.
		// Actually, let's just try to click a day that is likely to be in the future (e.g. 28).
		// If today is the 30th, 28 might be disabled (past) or next month (future).
		// A safer bet is to mock the date.

		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		const dayToPick = futureDate.getDate().toString();

		// Mock system date to a fixed value so the calendar always opens to a known month
		const fixedDate = new Date(2024, 5, 10); // June 10, 2024
		vi.setSystemTime(fixedDate);

		// We need to wait for the calendar to appear
		await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

		// Pick a known day (e.g., 15th of the month)
		const dayToPick = "15";
		const dayButton = screen.getByRole("button", { name: dayToPick });
		await user.click(dayButton);

		// Restore system time after test
		vi.useRealTimers();

		// Submit
		await user.click(screen.getByRole("button", { name: /create booking/i }));

		await waitFor(() => {
			expect(addDoc).toHaveBeenCalledTimes(1);
		});

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
