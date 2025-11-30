import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookingRoute } from "../routes/BookingRoute";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import * as useArtistsHook from "../hooks/useArtists";
import * as useAvailabilityHook from "../hooks/useAvailability";
import * as createAppointmentApi from "@/features/appointments/api/createAppointment";
import * as assignArtistUtils from "../utils/assignArtist";
import type { UserRole } from "@/features/users";

// Mock dependencies
vi.mock("@/context/AuthContext", () => ({
	useAuth: () => ({ user: { uid: "test-user" } }),
	AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("firebase/storage", () => ({
	getStorage: vi.fn(),
	ref: vi.fn(),
	uploadBytes: vi.fn(),
	getDownloadURL: vi.fn().mockResolvedValue("https://example.com/image.jpg"),
}));

vi.mock("@/lib/firebase", () => ({
	storage: {},
}));

// Mock data
const mockArtists = [
	{ id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "artist" as UserRole },
	{ id: "2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "artist" as UserRole },
];

const mockAvailability = ["10:00", "11:00", "14:00"];

describe("BookingRoute", () => {
	beforeEach(() => {
		vi.spyOn(useArtistsHook, "useArtists").mockReturnValue({
			data: mockArtists,
			isLoading: false,
			error: null,
			isError: false,
			isPending: false,
			isLoadingError: false,
			isRefetchError: false,
			isSuccess: true,
			status: "success",
			fetchStatus: "idle",
		} as unknown as ReturnType<typeof useArtistsHook.useArtists>);

		vi.spyOn(useAvailabilityHook, "useAvailability").mockReturnValue({
			availableTimes: mockAvailability,
			isLoading: false,
		});

		vi.spyOn(createAppointmentApi, "createAppointment").mockResolvedValue("new-appointment-id");
		vi.spyOn(assignArtistUtils, "assignArtist").mockResolvedValue(mockArtists[0]);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	const renderComponent = () => {
		return render(
			<BrowserRouter>
				<AuthProvider>
					<BookingRoute />
				</AuthProvider>
			</BrowserRouter>,
		);
	};

	it("renders the first step (Service Selection) initially", () => {
		renderComponent();
		expect(screen.getByText("Select service")).toBeInTheDocument();
		expect(screen.getByText("Small Tattoo")).toBeInTheDocument();
	});

	it("navigates through the steps correctly", async () => {
		renderComponent();

		// Step 1: Select Service
		fireEvent.click(screen.getByText("Small Tattoo"));
		const nextButton = screen.getByText("Next");
		expect(nextButton).toBeEnabled();
		fireEvent.click(nextButton);

		// Step 2: Select Artist
		expect(screen.getByText("Select artist")).toBeInTheDocument();
		fireEvent.click(screen.getByText("John Doe"));
		fireEvent.click(screen.getByText("Next"));

		// Step 3: Select Date & Time
		expect(screen.getByText("Select date & time")).toBeInTheDocument();
		// Date is pre-selected to today in the component
		fireEvent.click(screen.getByText("10:00"));
		fireEvent.click(screen.getByText("Next"));

		// Step 4: Details
		expect(screen.getByText("Your details")).toBeInTheDocument();
	});

	it("validates steps before allowing navigation", () => {
		renderComponent();

		// Step 1: Service (Initially disabled)
		const nextButton = screen.getByText("Next");
		expect(nextButton).toBeDisabled();

		// Select service -> Enabled
		fireEvent.click(screen.getByText("Small Tattoo"));
		expect(nextButton).toBeEnabled();
		fireEvent.click(nextButton);

		// Step 2: Artist (Initially disabled)
		expect(screen.getByText("Next")).toBeDisabled();
		fireEvent.click(screen.getByText("Any Artist"));
		expect(screen.getByText("Next")).toBeEnabled();
	});

	it("submits the form successfully", async () => {
		renderComponent();

		// Navigate to final step
		fireEvent.click(screen.getByText("Small Tattoo"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("John Doe"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("10:00"));
		fireEvent.click(screen.getByText("Next"));

		// Fill form
		fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test User" } });
		fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
		fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: "500 123 456" } }); // Valid PL number
		fireEvent.change(screen.getByLabelText(/Tattoo description/i), { target: { value: "A cool dragon tattoo" } });

		// Submit
		const submitButton = screen.getByText("Submit");
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(createAppointmentApi.createAppointment).toHaveBeenCalledWith(
				expect.objectContaining({
					clientName: "Test User",
					artistId: "1",
					type: "Small Tattoo",
				}),
			);
		});
	});

	it("handles 'Any Artist' selection correctly", async () => {
		renderComponent();

		// Navigate to final step with "Any Artist"
		fireEvent.click(screen.getByText("Small Tattoo"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("Any Artist"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("10:00"));
		fireEvent.click(screen.getByText("Next"));

		// Fill form
		fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test User" } });
		fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
		fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: "500 123 456" } });
		fireEvent.change(screen.getByLabelText(/Tattoo description/i), { target: { value: "A cool dragon tattoo" } });

		fireEvent.click(screen.getByText("Submit"));

		await waitFor(() => {
			expect(assignArtistUtils.assignArtist).toHaveBeenCalled();
			expect(createAppointmentApi.createAppointment).toHaveBeenCalledWith(
				expect.objectContaining({
					artistId: "1", // Assigned artist ID
				}),
			);
		});
	});

	it("uploads reference images correctly", async () => {
		renderComponent();

		// Navigate to final step
		fireEvent.click(screen.getByText("Small Tattoo"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("John Doe"));
		fireEvent.click(screen.getByText("Next"));
		fireEvent.click(screen.getByText("10:00"));
		fireEvent.click(screen.getByText("Next"));

		// Fill form
		fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test User" } });
		fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
		fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: "500 123 456" } });
		fireEvent.change(screen.getByLabelText(/Tattoo description/i), { target: { value: "A cool dragon tattoo" } });

		// Upload file
		const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
		const input = screen.getByLabelText(/Reference Images/i);

		fireEvent.change(input, { target: { files: [file] } });

		// Submit
		fireEvent.click(screen.getByText("Submit"));

		await waitFor(() => {
			expect(createAppointmentApi.createAppointment).toHaveBeenCalledWith(
				expect.objectContaining({
					referenceImageUrls: ["https://example.com/image.jpg"],
				}),
			);
		});
	});
});
