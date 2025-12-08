import { describe, it, expect, vi, beforeEach } from "vitest";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { cancelAppointmentByToken, getAppointmentForCancel } from "./cancelAppointmentByToken";

// Mock firebase/firestore
vi.mock("firebase/firestore", () => ({
	doc: vi.fn(() => ({ id: "mock-doc-ref" })),
	getDoc: vi.fn(),
	updateDoc: vi.fn(),
	serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

// Mock firebase
vi.mock("@/lib/firebase", () => ({
	db: { type: "firestore" },
}));

const mockDoc = vi.mocked(doc);
const mockGetDoc = vi.mocked(getDoc);
const mockUpdateDoc = vi.mocked(updateDoc);

/**
 * Helper to create mock appointment data
 */
function createMockAppointment(overrides: Record<string, unknown> = {}) {
	const now = new Date();
	const futureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

	return {
		exists: () => true,
		id: "appointment-123",
		data: () => ({
			clientName: "John Doe",
			artistName: "Jane Artist",
			type: "Large Tattoo",
			status: "upcoming",
			cancellationToken: "valid-token-123",
			startTime: { toDate: () => futureDate },
			endTime: { toDate: () => new Date(futureDate.getTime() + 60 * 60 * 1000) },
			...overrides,
		}),
	};
}

describe("getAppointmentForCancel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns appointment data for valid token", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment() as never);

		const result = await getAppointmentForCancel("appointment-123", "valid-token-123");

		expect(mockDoc).toHaveBeenCalledWith({ type: "firestore" }, "appointments", "appointment-123");
		expect("appointment" in result).toBe(true);
		if ("appointment" in result) {
			expect(result.appointment.clientName).toBe("John Doe");
			expect(result.appointment.artistName).toBe("Jane Artist");
			expect(result.appointment.type).toBe("Large Tattoo");
		}
	});

	it("returns NOT_FOUND error for non-existent appointment", async () => {
		mockGetDoc.mockResolvedValue({ exists: () => false } as never);

		const result = await getAppointmentForCancel("non-existent", "any-token");

		expect("error" in result).toBe(true);
		if ("error" in result) {
			expect(result.error).toBe("NOT_FOUND");
		}
	});

	it("returns INVALID_TOKEN error for wrong token", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment() as never);

		const result = await getAppointmentForCancel("appointment-123", "wrong-token");

		expect("error" in result).toBe(true);
		if ("error" in result) {
			expect(result.error).toBe("INVALID_TOKEN");
		}
	});

	it("returns INVALID_TOKEN error when appointment has no token", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment({ cancellationToken: undefined }) as never);

		const result = await getAppointmentForCancel("appointment-123", "any-token");

		expect("error" in result).toBe(true);
		if ("error" in result) {
			expect(result.error).toBe("INVALID_TOKEN");
		}
	});
});

describe("cancelAppointmentByToken", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("successfully cancels appointment with valid token", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment() as never);
		mockUpdateDoc.mockResolvedValue(undefined);

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(true);
		expect(mockUpdateDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				status: "cancelled",
			}),
		);
	});

	it("returns NOT_FOUND error for non-existent appointment", async () => {
		mockGetDoc.mockResolvedValue({ exists: () => false } as never);

		const result = await cancelAppointmentByToken("non-existent", "any-token");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("NOT_FOUND");
		}
		expect(mockUpdateDoc).not.toHaveBeenCalled();
	});

	it("returns INVALID_TOKEN error for wrong token", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment() as never);

		const result = await cancelAppointmentByToken("appointment-123", "wrong-token");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("INVALID_TOKEN");
		}
		expect(mockUpdateDoc).not.toHaveBeenCalled();
	});

	it("returns ALREADY_CANCELLED error for cancelled appointment", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment({ status: "cancelled" }) as never);

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("ALREADY_CANCELLED");
		}
		expect(mockUpdateDoc).not.toHaveBeenCalled();
	});

	it("returns ALREADY_COMPLETED error for completed appointment", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment({ status: "completed" }) as never);

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("ALREADY_COMPLETED");
		}
		expect(mockUpdateDoc).not.toHaveBeenCalled();
	});

	it("returns ALREADY_COMPLETED error for past appointment", async () => {
		const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

		mockGetDoc.mockResolvedValue(
			createMockAppointment({
				startTime: { toDate: () => pastDate },
			}) as never,
		);

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("ALREADY_COMPLETED");
		}
		expect(mockUpdateDoc).not.toHaveBeenCalled();
	});

	it("returns TOO_LATE error when within 24 hours of appointment", async () => {
		const now = new Date();
		const soonDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now

		mockGetDoc.mockResolvedValue(
			createMockAppointment({
				startTime: { toDate: () => soonDate },
			}) as never,
		);

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("TOO_LATE");
		}
		expect(mockUpdateDoc).not.toHaveBeenCalled();
	});

	it("allows cancellation exactly at 24 hours before", async () => {
		const now = new Date();
		const exactlyAt24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 1000); // Just over 24 hours

		mockGetDoc.mockResolvedValue(
			createMockAppointment({
				startTime: { toDate: () => exactlyAt24Hours },
			}) as never,
		);
		mockUpdateDoc.mockResolvedValue(undefined);

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(true);
	});

	it("returns UNKNOWN error when updateDoc fails", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment() as never);
		mockUpdateDoc.mockRejectedValue(new Error("Firestore error"));

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("UNKNOWN");
		}
	});

	it("validates pending appointments can be cancelled", async () => {
		mockGetDoc.mockResolvedValue(createMockAppointment({ status: "pending" }) as never);
		mockUpdateDoc.mockResolvedValue(undefined);

		const result = await cancelAppointmentByToken("appointment-123", "valid-token-123");

		expect(result.success).toBe(true);
	});
});
