import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { AppointmentDetailSheet } from "./AppointmentDetailSheet";
import { useAppointmentDetail, useUpdateAppointmentStatus } from "@/features/appointments";
import type { UpcomingAppointment, AppointmentDetail } from "@/features/appointments";

// Mock the hooks
vi.mock("@/features/appointments", () => ({
	useAppointmentDetail: vi.fn(),
	useUpdateAppointmentStatus: vi.fn(),
}));

// Mock RescheduleDialog to avoid needing QueryClientProvider
vi.mock("./RescheduleDialog", () => ({
	RescheduleDialog: () => null,
}));

describe("AppointmentDetailSheet", () => {
	const mockUpdateStatus = vi.fn();
	const mockOnOpenChange = vi.fn();

	const mockPendingAppointment: UpcomingAppointment = {
		id: "appt-123",
		title: "John Doe",
		type: "Small Tattoo",
		dateRange: "December 15, 2025, 14:00 - 15:00",
		image: "https://example.com/image.jpg",
		status: "pending",
	};

	const mockUpcomingAppointment: UpcomingAppointment = {
		id: "appt-456",
		title: "Jane Smith",
		type: "Large Tattoo",
		dateRange: "December 20, 2025, 10:00 - 12:00",
		image: "https://example.com/image2.jpg",
		status: "upcoming",
	};

	const mockPendingDetail: AppointmentDetail = {
		id: "appt-123",
		artistId: "artist-1",
		clientName: "John Doe",
		clientEmail: "john.doe@example.com",
		clientPhone: "+48 123 456 789",
		description: "I want a small geometric wolf tattoo on my forearm.",
		type: "Small Tattoo",
		status: "pending",
		artistName: "Artist Name",
		startTime: new Date("2025-12-15T14:00:00"),
		endTime: new Date("2025-12-15T15:00:00"),
		referenceImageUrls: [
			"https://firebasestorage.example.com/image1.jpg",
			"https://firebasestorage.example.com/image2.jpg",
		],
	};

	const mockUpcomingDetail: AppointmentDetail = {
		id: "appt-456",
		artistId: "artist-2",
		clientName: "Jane Smith",
		clientEmail: "jane.smith@example.com",
		clientPhone: "+48 987 654 321",
		description: "Full sleeve design consultation.",
		type: "Large Tattoo",
		status: "upcoming",
		artistName: "Artist Name",
		startTime: new Date("2025-12-20T10:00:00"),
		endTime: new Date("2025-12-20T12:00:00"),
		referenceImageUrls: [],
	};

	beforeEach(() => {
		vi.clearAllMocks();

		(useUpdateAppointmentStatus as Mock).mockReturnValue({
			mutate: mockUpdateStatus,
			isPending: false,
		});
	});

	// ==========================================
	// 1. Sheet opens/closes correctly
	// ==========================================

	it("renders nothing when closed", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: null,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet
				appointment={mockPendingAppointment}
				open={false}
				onOpenChange={mockOnOpenChange}
			/>,
		);

		expect(screen.queryByText("Appointment details")).not.toBeInTheDocument();
	});

	it("renders sheet content when open", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByText("Appointment details")).toBeInTheDocument();
	});

	it("does not fetch data when sheet is closed", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: null,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet
				appointment={mockPendingAppointment}
				open={false}
				onOpenChange={mockOnOpenChange}
			/>,
		);

		// The hook should be called with null when closed
		expect(useAppointmentDetail).toHaveBeenCalledWith(null);
	});

	it("fetches data when sheet is open", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(useAppointmentDetail).toHaveBeenCalledWith("appt-123");
	});

	// ==========================================
	// 2. Appointment details are displayed properly
	// ==========================================

	it("displays client name and contact info", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
		expect(screen.getByText("+48 123 456 789")).toBeInTheDocument();
	});

	it("displays appointment type badge", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByText("Small Tattoo")).toBeInTheDocument();
	});

	it("displays client description/notes", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByText("Client Notes")).toBeInTheDocument();
		expect(screen.getByText(/"I want a small geometric wolf tattoo on my forearm."/)).toBeInTheDocument();
	});

	it("displays reference images when available", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByText("Reference Images (2)")).toBeInTheDocument();
		expect(screen.getByAltText("Reference 1")).toBeInTheDocument();
		expect(screen.getByAltText("Reference 2")).toBeInTheDocument();
	});

	it("does not display reference images section when none available", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockUpcomingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet
				appointment={mockUpcomingAppointment}
				open={true}
				onOpenChange={mockOnOpenChange}
			/>,
		);

		expect(screen.queryByText(/Reference Images/)).not.toBeInTheDocument();
	});

	it("displays formatted date and time with duration", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		// Format: "15 December 2025, 14:00 - 15:00 (60m)"
		expect(screen.getByText(/15 December 2025, 14:00 - 15:00 \(60m\)/)).toBeInTheDocument();
	});

	// ==========================================
	// 3. Action buttons work correctly
	// ==========================================

	it("calls updateStatus with 'upcoming' when Approve is clicked", async () => {
		const user = userEvent.setup();

		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		await user.click(screen.getByRole("button", { name: /approve appointment/i }));

		expect(mockUpdateStatus).toHaveBeenCalledWith(
			{
				appointmentId: "appt-123",
				status: "upcoming",
				successMessage: "Appointment approved",
			},
			expect.objectContaining({ onSettled: expect.any(Function) }),
		);
	});

	it("calls updateStatus with 'cancelled' when Decline is clicked", async () => {
		const user = userEvent.setup();

		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		await user.click(screen.getByRole("button", { name: /decline/i }));

		expect(mockUpdateStatus).toHaveBeenCalledWith(
			{
				appointmentId: "appt-123",
				status: "cancelled",
				successMessage: "Appointment declined",
			},
			expect.objectContaining({ onSettled: expect.any(Function) }),
		);
	});

	it("calls updateStatus with 'cancelled' when Cancel is clicked for upcoming appointment", async () => {
		const user = userEvent.setup();

		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockUpcomingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet
				appointment={mockUpcomingAppointment}
				open={true}
				onOpenChange={mockOnOpenChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /cancel appointment/i }));

		expect(mockUpdateStatus).toHaveBeenCalledWith(
			{
				appointmentId: "appt-456",
				status: "cancelled",
				successMessage: "Appointment cancelled",
			},
			expect.objectContaining({ onSettled: expect.any(Function) }),
		);
	});

	it("closes sheet after successful action", async () => {
		const user = userEvent.setup();

		// Mock mutate to immediately call onSettled
		mockUpdateStatus.mockImplementation((_, options) => {
			options.onSettled();
		});

		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		await user.click(screen.getByRole("button", { name: /approve appointment/i }));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it("disables buttons while action is pending", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		(useUpdateAppointmentStatus as Mock).mockReturnValue({
			mutate: mockUpdateStatus,
			isPending: true,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByRole("button", { name: /approve appointment/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /decline/i })).toBeDisabled();
	});

	// ==========================================
	// 4. Loading and error states are handled
	// ==========================================

	it("shows loading spinner while fetching data", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: null,
			isLoading: true,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		// Check for the Loader2 spinner (it has animate-spin class)
		const spinner = document.querySelector(".animate-spin");
		expect(spinner).toBeInTheDocument();
	});

	it("shows 'Appointment not found' when data is null after loading", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: null,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByText("Appointment not found")).toBeInTheDocument();
	});

	// ==========================================
	// 5. Conditional rendering based on status
	// ==========================================

	it("shows Pending Approval badge for pending appointments", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByText("Pending Approval")).toBeInTheDocument();
	});

	it("does not show Pending Approval badge for upcoming appointments", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockUpcomingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet
				appointment={mockUpcomingAppointment}
				open={true}
				onOpenChange={mockOnOpenChange}
			/>,
		);

		expect(screen.queryByText("Pending Approval")).not.toBeInTheDocument();
	});

	it("shows Approve/Decline buttons for pending appointments", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockPendingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.getByRole("button", { name: /approve appointment/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /decline/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /reschedule/i })).not.toBeInTheDocument();
	});

	it("shows Reschedule/Cancel buttons for upcoming appointments", () => {
		(useAppointmentDetail as Mock).mockReturnValue({
			data: mockUpcomingDetail,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet
				appointment={mockUpcomingAppointment}
				open={true}
				onOpenChange={mockOnOpenChange}
			/>,
		);

		expect(screen.getByRole("button", { name: /reschedule/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /cancel appointment/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /approve/i })).not.toBeInTheDocument();
	});

	it("does not show Client Notes section when description is empty", () => {
		const detailWithoutDescription: AppointmentDetail = {
			...mockPendingDetail,
			description: undefined,
		};

		(useAppointmentDetail as Mock).mockReturnValue({
			data: detailWithoutDescription,
			isLoading: false,
		});

		render(
			<AppointmentDetailSheet appointment={mockPendingAppointment} open={true} onOpenChange={mockOnOpenChange} />,
		);

		expect(screen.queryByText("Client Notes")).not.toBeInTheDocument();
	});
});
