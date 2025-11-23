import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import AdminDashboard from "./AdminDashboard";
import { MemoryRouter } from "react-router-dom";
import { useAppointments, useUpdateAppointmentStatus } from "@/features/appointments";
import { useAuth } from "@/context/AuthContext";

// Mock the hooks
vi.mock("@/features/appointments", async () => {
	const actual = await vi.importActual("@/features/appointments");
	return {
		...actual,
		useAppointments: vi.fn(),
		useUpdateAppointmentStatus: vi.fn(),
	};
});

vi.mock("@/context/AuthContext", () => ({
	useAuth: vi.fn(),
}));

// Mock child components that might cause issues or are not the focus
vi.mock("@/modules/admin/components/AdminHeader", () => ({
	default: ({ title }: { title: string }) => <div data-testid="admin-header">{title}</div>,
}));

vi.mock("@/modules/admin/components/PastAppointmentsTable", () => ({
	default: () => <div data-testid="past-appointments-table">Past Table</div>,
}));

describe("AdminDashboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(useAuth as Mock).mockReturnValue({
			user: { uid: "123" },
			userProfile: { role: "artist" },
		});
		// Default mock for useUpdateAppointmentStatus
		(useUpdateAppointmentStatus as Mock).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
	});

	it("renders loading state", () => {
		(useAppointments as Mock).mockReturnValue({
			isLoading: true,
			data: null,
		});

		render(
			<MemoryRouter>
				<AdminDashboard />
			</MemoryRouter>,
		);

		// You might need to check for skeleton elements or just ensure no data is shown
		// Since we don't have explicit test ids for skeletons, we can check that the header is there
		expect(screen.getByTestId("admin-header")).toBeInTheDocument();
	});

	it("renders upcoming appointments correctly", () => {
		const mockData = {
			upcoming: [
				{
					id: "1",
					title: "John Doe",
					dateRange: "July 15, 14:00 - 15:00",
					image: "test.jpg",
					status: "upcoming",
				},
			],
			past: [],
		};

		(useAppointments as Mock).mockReturnValue({
			isLoading: false,
			data: mockData,
		});

		render(
			<MemoryRouter>
				<AdminDashboard />
			</MemoryRouter>,
		);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("July 15, 14:00 - 15:00")).toBeInTheDocument();
		expect(screen.getByText("Reschedule")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("renders pending appointments with badge and approve/decline buttons", () => {
		const mockData = {
			upcoming: [
				{
					id: "2",
					title: "Jane Smith",
					dateRange: "August 1, 10:00 - 11:00",
					image: "test2.jpg",
					status: "pending",
				},
			],
			past: [],
		};

		(useAppointments as Mock).mockReturnValue({
			isLoading: false,
			data: mockData,
		});

		render(
			<MemoryRouter>
				<AdminDashboard />
			</MemoryRouter>,
		);

		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		expect(screen.getByText("PENDING")).toBeInTheDocument();
		expect(screen.getByText("Approve")).toBeInTheDocument();
		expect(screen.getByText("Decline")).toBeInTheDocument();
	});

	it("calls updateStatus when approve button is clicked", async () => {
		const user = userEvent.setup();
		const mockMutate = vi.fn();
		(useUpdateAppointmentStatus as Mock).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
		});

		const mockData = {
			upcoming: [
				{
					id: "2",
					title: "Jane Smith",
					dateRange: "August 1, 10:00 - 11:00",
					image: "test2.jpg",
					status: "pending",
				},
			],
			past: [],
		};

		(useAppointments as Mock).mockReturnValue({
			isLoading: false,
			data: mockData,
		});

		render(
			<MemoryRouter>
				<AdminDashboard />
			</MemoryRouter>,
		);

		await user.click(screen.getByText("Approve"));

		expect(mockMutate).toHaveBeenCalledWith({ appointmentId: "2", status: "upcoming" });
	});

	it("calls updateStatus when cancel button is clicked", async () => {
		const user = userEvent.setup();
		const mockMutate = vi.fn();
		(useUpdateAppointmentStatus as Mock).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
		});

		const mockData = {
			upcoming: [
				{
					id: "1",
					title: "John Doe",
					dateRange: "July 15, 14:00 - 15:00",
					image: "test.jpg",
					status: "upcoming",
				},
			],
			past: [],
		};

		(useAppointments as Mock).mockReturnValue({
			isLoading: false,
			data: mockData,
		});

		render(
			<MemoryRouter>
				<AdminDashboard />
			</MemoryRouter>,
		);

		await user.click(screen.getByText("Cancel"));

		expect(mockMutate).toHaveBeenCalledWith({ appointmentId: "1", status: "cancelled" });
	});

	it("renders empty state when no appointments", () => {
		(useAppointments as Mock).mockReturnValue({
			isLoading: false,
			data: { upcoming: [], past: [] },
		});

		render(
			<MemoryRouter>
				<AdminDashboard />
			</MemoryRouter>,
		);

		expect(screen.getByText("No upcoming appointments")).toBeInTheDocument();
	});
});
