import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { RescheduleDialog } from "./RescheduleDialog";
import { useRescheduleAppointment, type AppointmentDetail } from "@/features/appointments";
import { useAvailability } from "@/modules/booking/hooks/useAvailability";

// Mock the hooks
vi.mock("@/features/appointments", () => ({
	useRescheduleAppointment: vi.fn(),
}));

vi.mock("@/modules/booking/hooks/useAvailability", () => ({
	useAvailability: vi.fn(),
}));

describe("RescheduleDialog", () => {
	const mockReschedule = vi.fn();
	const mockOnOpenChange = vi.fn();
	const mockOnSuccess = vi.fn();

	const mockAppointment: AppointmentDetail = {
		id: "appt-123",
		artistId: "artist-1",
		clientName: "John Doe",
		clientEmail: "john.doe@example.com",
		clientPhone: "+48 123 456 789",
		description: "Geometric wolf tattoo",
		type: "Small Tattoo",
		status: "upcoming",
		artistName: "Artist Name",
		startTime: new Date("2025-12-15T14:00:00"),
		endTime: new Date("2025-12-15T15:00:00"),
		referenceImageUrls: [],
	};

	const availableTimeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

	// Helper to select a date by its data-day attribute (format: "d.mm.yyyy")
	const selectDate = (dataDay: string) => {
		const dateButton = document.querySelector(`[data-day="${dataDay}"]`) as HTMLElement;
		if (!dateButton) throw new Error(`Date button with data-day="${dataDay}" not found`);
		return dateButton;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Use fake timers to control date for calendar
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(new Date("2025-12-01T10:00:00"));

		(useRescheduleAppointment as Mock).mockReturnValue({
			mutate: mockReschedule,
			isPending: false,
		});

		(useAvailability as Mock).mockReturnValue({
			availableTimes: availableTimeSlots,
			isLoading: false,
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// ==========================================
	// 1. Dialog opens/closes correctly
	// ==========================================

	it("renders nothing when closed", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={false} onOpenChange={mockOnOpenChange} />);

		expect(screen.queryByText("Reschedule appointment")).not.toBeInTheDocument();
	});

	it("renders dialog content when open", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.getByText("Reschedule appointment")).toBeInTheDocument();
	});

	it("calls onOpenChange with false when Cancel button is clicked", async () => {
		const user = userEvent.setup();

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		await user.click(screen.getByRole("button", { name: /cancel/i }));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	// ==========================================
	// 2. Current schedule is displayed
	// ==========================================

	it("displays client name in description", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.getByText(/John Doe/)).toBeInTheDocument();
	});

	it("displays current schedule date", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.getByText(/Monday, 15 December 2025/)).toBeInTheDocument();
	});

	it("displays current schedule time and duration", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		// Time range with duration
		expect(screen.getByText(/14:00 - 15:00 \(60m\)/)).toBeInTheDocument();
	});

	// ==========================================
	// 3. Date selection works
	// ==========================================

	it("shows calendar for date selection", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.getByText("Select New Date")).toBeInTheDocument();
		// Calendar component is present
		expect(screen.getByRole("grid")).toBeInTheDocument();
	});

	it("does not show time slots before date is selected", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.queryByText("Select New Time")).not.toBeInTheDocument();
	});

	it("shows time slots after date is selected", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		// Click on December 20, 2025 using data-day attribute
		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		expect(screen.getByText("Select New Time")).toBeInTheDocument();
	});

	// ==========================================
	// 4. Time slot selection works
	// ==========================================

	it("displays available time slots after date selection", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		// Check that time slots are rendered
		expect(screen.getByRole("button", { name: "09:00" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "10:00" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "14:00" })).toBeInTheDocument();
	});

	it("shows loading spinner while fetching availability", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		(useAvailability as Mock).mockReturnValue({
			availableTimes: [],
			isLoading: true,
		});

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		// Check for loading indicator using accessible role
		const loadingIndicator = screen.getByRole("status", { name: /loading available times/i });
		expect(loadingIndicator).toBeInTheDocument();
	});

	// ==========================================
	// 5. New schedule preview
	// ==========================================

	it("does not show new schedule preview before selection is complete", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.queryByText("New Schedule")).not.toBeInTheDocument();
	});

	it("shows new schedule preview after date and time are selected", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		// Select date
		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		// Select time
		const timeButton = screen.getByRole("button", { name: "10:00" });
		await user.click(timeButton);

		expect(screen.getByText("New Schedule")).toBeInTheDocument();
		expect(screen.getByText(/Saturday, 20 December 2025/)).toBeInTheDocument();
		expect(screen.getByText(/10:00 - 11:00 \(60m\)/)).toBeInTheDocument();
	});

	// ==========================================
	// 6. Confirm button behavior
	// ==========================================

	it("disables confirm button when no date is selected", () => {
		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.getByRole("button", { name: /confirm reschedule/i })).toBeDisabled();
	});

	it("disables confirm button when date but no time is selected", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		expect(screen.getByRole("button", { name: /confirm reschedule/i })).toBeDisabled();
	});

	it("enables confirm button when date and time are selected", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		const timeButton = screen.getByRole("button", { name: "10:00" });
		await user.click(timeButton);

		expect(screen.getByRole("button", { name: /confirm reschedule/i })).toBeEnabled();
	});

	// ==========================================
	// 7. Reschedule submission
	// ==========================================

	it("calls reschedule mutation with correct data when confirmed", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		// Select date (December 20, 2025)
		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		// Select time (10:00)
		const timeButton = screen.getByRole("button", { name: "10:00" });
		await user.click(timeButton);

		// Confirm
		await user.click(screen.getByRole("button", { name: /confirm reschedule/i }));

		expect(mockReschedule).toHaveBeenCalledWith(
			expect.objectContaining({
				appointmentId: "appt-123",
				newStartTime: expect.any(Date),
				newEndTime: expect.any(Date),
			}),
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);

		// Verify the times are correct
		const callArgs = mockReschedule.mock.calls[0][0];
		expect(callArgs.newStartTime.getHours()).toBe(10);
		expect(callArgs.newStartTime.getMinutes()).toBe(0);
		expect(callArgs.newEndTime.getHours()).toBe(11);
		expect(callArgs.newEndTime.getMinutes()).toBe(0);
	});

	it("closes dialog and calls onSuccess after successful reschedule", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		mockReschedule.mockImplementation((_, options) => {
			options.onSuccess();
		});

		render(
			<RescheduleDialog
				appointment={mockAppointment}
				open={true}
				onOpenChange={mockOnOpenChange}
				onSuccess={mockOnSuccess}
			/>,
		);

		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		const timeButton = screen.getByRole("button", { name: "10:00" });
		await user.click(timeButton);

		await user.click(screen.getByRole("button", { name: /confirm reschedule/i }));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		expect(mockOnSuccess).toHaveBeenCalled();
	});

	it("disables confirm button while reschedule is pending", () => {
		(useRescheduleAppointment as Mock).mockReturnValue({
			mutate: mockReschedule,
			isPending: true,
		});

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.getByRole("button", { name: /confirm reschedule/i })).toBeDisabled();
	});

	it("shows loading spinner on confirm button while reschedule is pending", () => {
		// Set isPending to true from the start
		(useRescheduleAppointment as Mock).mockReturnValue({
			mutate: mockReschedule,
			isPending: true,
		});

		render(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		// Check for aria-busy attribute on the confirm button indicating loading state
		const confirmButton = screen.getByRole("button", { name: /confirm reschedule/i });
		expect(confirmButton).toHaveAttribute("aria-busy", "true");
	});

	// ==========================================
	// 8. Resets state on close
	// ==========================================

	it("resets date and time selection when dialog is closed", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		const { rerender } = render(
			<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		// Select date and time
		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		const timeButton = screen.getByRole("button", { name: "10:00" });
		await user.click(timeButton);

		// New Schedule preview should be visible
		expect(screen.getByText("New Schedule")).toBeInTheDocument();

		// Close dialog
		await user.click(screen.getByRole("button", { name: /^cancel$/i }));

		// Simulate reopening the dialog
		rerender(<RescheduleDialog appointment={mockAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		// State should be reset - no New Schedule preview
		expect(screen.queryByText("New Schedule")).not.toBeInTheDocument();
		expect(screen.queryByText("Select New Time")).not.toBeInTheDocument();
	});

	// ==========================================
	// 9. Duration calculation
	// ==========================================

	it("calculates correct duration for 2-hour appointment", () => {
		const twoHourAppointment: AppointmentDetail = {
			...mockAppointment,
			startTime: new Date("2025-12-15T10:00:00"),
			endTime: new Date("2025-12-15T12:00:00"),
		};

		render(<RescheduleDialog appointment={twoHourAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		expect(screen.getByText(/10:00 - 12:00 \(120m\)/)).toBeInTheDocument();
	});

	it("passes correct duration to useAvailability hook", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		const twoHourAppointment: AppointmentDetail = {
			...mockAppointment,
			startTime: new Date("2025-12-15T10:00:00"),
			endTime: new Date("2025-12-15T12:00:00"),
		};

		render(<RescheduleDialog appointment={twoHourAppointment} open={true} onOpenChange={mockOnOpenChange} />);

		const dateButton = selectDate("20.12.2025");
		await user.click(dateButton);

		// Verify useAvailability was called with 120 minute duration
		expect(useAvailability).toHaveBeenCalledWith(expect.any(Date), 120, "artist-1");
	});
});
