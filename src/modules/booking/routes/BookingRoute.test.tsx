import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

vi.mock("firebase/firestore", () => ({
	collection: vi.fn(),
	doc: vi.fn(() => ({ id: "mock-appointment-id" })),
	setDoc: vi.fn(),
	Timestamp: {
		fromDate: vi.fn((date) => date),
	},
}));

vi.mock("@/lib/firebase", () => ({
	storage: {},
	db: {},
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
		const user = userEvent.setup();
		renderComponent();

		// Step 1: Select Service
		await user.click(screen.getByText("Small Tattoo"));
		const nextButton = screen.getByText("Next");
		expect(nextButton).toBeEnabled();
		await user.click(nextButton);

		// Step 2: Select Artist
		expect(screen.getByText("Select artist")).toBeInTheDocument();
		await user.click(screen.getByText("John Doe"));
		await user.click(screen.getByText("Next"));

		// Step 3: Select Date & Time
		expect(screen.getByText("Select date & time")).toBeInTheDocument();
		// Date is pre-selected to today in the component
		await user.click(screen.getByText("10:00"));
		await user.click(screen.getByText("Next"));

		// Step 4: Details
		expect(screen.getByText("Your details")).toBeInTheDocument();
	});

	it("validates steps before allowing navigation", async () => {
		const user = userEvent.setup();
		renderComponent();

		// Step 1: Service (Initially disabled)
		const nextButton = screen.getByText("Next");
		expect(nextButton).toBeDisabled();

		// Select service -> Enabled
		await user.click(screen.getByText("Small Tattoo"));
		expect(nextButton).toBeEnabled();
		await user.click(nextButton);

		// Step 2: Artist (Initially disabled)
		expect(screen.getByText("Next")).toBeDisabled();
		await user.click(screen.getByText("Any Artist"));
		expect(screen.getByText("Next")).toBeEnabled();
	});

	it("submits the form successfully", async () => {
		const user = userEvent.setup();
		renderComponent();

		// Navigate to final step
		await user.click(screen.getByText("Small Tattoo"));
		await user.click(screen.getByText("Next"));
		await user.click(screen.getByText("John Doe"));
		await user.click(screen.getByText("Next"));
		await user.click(screen.getByText("10:00"));
		await user.click(screen.getByText("Next"));

		// Fill form using userEvent for more realistic behavior
		await user.type(screen.getByLabelText(/Name/i), "Test User");
		await user.type(screen.getByLabelText(/Email/i), "test@example.com");
		await user.type(screen.getByLabelText(/Phone/i), "500 123 456"); // Valid PL number
		await user.type(screen.getByLabelText(/Tattoo description/i), "A cool dragon tattoo");

		// Submit
		const submitButton = screen.getByText("Submit");
		await user.click(submitButton);

		await waitFor(() => {
			expect(createAppointmentApi.createAppointment).toHaveBeenCalledWith(
				expect.objectContaining({
					clientName: "Test User",
					artistId: "1",
					type: "Small Tattoo",
				}),
				"mock-appointment-id",
			);
		});
	});

	it("handles 'Any Artist' selection correctly", async () => {
		const user = userEvent.setup();
		renderComponent();

		// Navigate to final step with "Any Artist"
		await user.click(screen.getByText("Small Tattoo"));
		await user.click(screen.getByText("Next"));
		await user.click(screen.getByText("Any Artist"));
		await user.click(screen.getByText("Next"));
		await user.click(screen.getByText("10:00"));
		await user.click(screen.getByText("Next"));

		// Fill form
		await user.type(screen.getByLabelText(/Name/i), "Test User");
		await user.type(screen.getByLabelText(/Email/i), "test@example.com");
		await user.type(screen.getByLabelText(/Phone/i), "500 123 456");
		await user.type(screen.getByLabelText(/Tattoo description/i), "A cool dragon tattoo");

		await user.click(screen.getByText("Submit"));

		await waitFor(() => {
			expect(assignArtistUtils.assignArtist).toHaveBeenCalled();
			expect(createAppointmentApi.createAppointment).toHaveBeenCalledWith(
				expect.objectContaining({
					artistId: "1", // Assigned artist ID
				}),
				"mock-appointment-id",
			);
		});
	});

	it("uploads reference images correctly", async () => {
		const user = userEvent.setup();
		renderComponent();

		// Navigate to final step
		await user.click(screen.getByText("Small Tattoo"));
		await user.click(screen.getByText("Next"));
		await user.click(screen.getByText("John Doe"));
		await user.click(screen.getByText("Next"));
		await user.click(screen.getByText("10:00"));
		await user.click(screen.getByText("Next"));

		// Fill form
		await user.type(screen.getByLabelText(/Name/i), "Test User");
		await user.type(screen.getByLabelText(/Email/i), "test@example.com");
		await user.type(screen.getByLabelText(/Phone/i), "500 123 456");
		await user.type(screen.getByLabelText(/Tattoo description/i), "A cool dragon tattoo");

		// Upload file using userEvent
		const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
		const input = screen.getByLabelText(/Reference Images/i);
		await user.upload(input, file);

		// Submit
		await user.click(screen.getByText("Submit"));

		await waitFor(() => {
			expect(createAppointmentApi.createAppointment).toHaveBeenCalledWith(
				expect.objectContaining({
					referenceImageUrls: ["https://example.com/image.jpg"],
				}),
				"mock-appointment-id",
			);
		});
	});
});
