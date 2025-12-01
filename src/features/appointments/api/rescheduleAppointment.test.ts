import { describe, it, expect, vi, beforeEach } from "vitest";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { rescheduleAppointment } from "./rescheduleAppointment";

// Mock firebase/firestore
vi.mock("firebase/firestore", () => ({
	doc: vi.fn(() => ({ id: "mock-doc-ref" })),
	updateDoc: vi.fn(),
	Timestamp: {
		fromDate: vi.fn((date: Date) => ({
			toDate: () => date,
			seconds: Math.floor(date.getTime() / 1000),
			nanoseconds: 0,
		})),
	},
}));

// Mock firebase
vi.mock("@/lib/firebase", () => ({
	db: { type: "firestore" },
}));

const mockDoc = vi.mocked(doc);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockTimestampFromDate = vi.mocked(Timestamp.fromDate);

describe("rescheduleAppointment", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("successful reschedule", () => {
		it("updates appointment with new start and end times", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const newStartTime = new Date("2025-12-15T10:00:00");
			const newEndTime = new Date("2025-12-15T11:30:00");

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime,
				newEndTime,
			});

			// Verify doc was called with correct path
			expect(mockDoc).toHaveBeenCalledWith({ type: "firestore" }, "appointments", "appointment-123");

			// Verify updateDoc was called with Timestamp conversions
			expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
			expect(mockUpdateDoc).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					startTime: expect.objectContaining({
						seconds: Math.floor(newStartTime.getTime() / 1000),
					}),
					endTime: expect.objectContaining({
						seconds: Math.floor(newEndTime.getTime() / 1000),
					}),
				}),
			);
		});

		it("converts Date objects to Firestore Timestamps", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const newStartTime = new Date("2025-12-20T14:00:00");
			const newEndTime = new Date("2025-12-20T15:00:00");

			await rescheduleAppointment({
				appointmentId: "appointment-456",
				newStartTime,
				newEndTime,
			});

			// Verify Timestamp.fromDate was called for both dates
			expect(mockTimestampFromDate).toHaveBeenCalledTimes(2);
			expect(mockTimestampFromDate).toHaveBeenCalledWith(newStartTime);
			expect(mockTimestampFromDate).toHaveBeenCalledWith(newEndTime);
		});

		it("resolves without returning a value on success", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const result = await rescheduleAppointment({
				appointmentId: "appointment-789",
				newStartTime: new Date("2025-12-25T09:00:00"),
				newEndTime: new Date("2025-12-25T10:00:00"),
			});

			expect(result).toBeUndefined();
		});
	});

	describe("Firestore error handling", () => {
		it("throws error when Firestore updateDoc fails", async () => {
			const firestoreError = new Error("Firestore: Permission denied");
			mockUpdateDoc.mockRejectedValue(firestoreError);

			await expect(
				rescheduleAppointment({
					appointmentId: "appointment-123",
					newStartTime: new Date("2025-12-15T10:00:00"),
					newEndTime: new Date("2025-12-15T11:00:00"),
				}),
			).rejects.toThrow("Firestore: Permission denied");
		});

		it("throws error when document does not exist", async () => {
			const notFoundError = new Error("No document to update");
			mockUpdateDoc.mockRejectedValue(notFoundError);

			await expect(
				rescheduleAppointment({
					appointmentId: "non-existent-id",
					newStartTime: new Date("2025-12-15T10:00:00"),
					newEndTime: new Date("2025-12-15T11:00:00"),
				}),
			).rejects.toThrow("No document to update");
		});

		it("throws error on network failure", async () => {
			const networkError = new Error("Network request failed");
			mockUpdateDoc.mockRejectedValue(networkError);

			await expect(
				rescheduleAppointment({
					appointmentId: "appointment-123",
					newStartTime: new Date("2025-12-15T10:00:00"),
					newEndTime: new Date("2025-12-15T11:00:00"),
				}),
			).rejects.toThrow("Network request failed");
		});
	});

	describe("timestamp conversion validation", () => {
		it("handles dates at midnight correctly", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const midnightStart = new Date("2025-12-15T00:00:00");
			const midnightEnd = new Date("2025-12-15T01:00:00");

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: midnightStart,
				newEndTime: midnightEnd,
			});

			expect(mockTimestampFromDate).toHaveBeenCalledWith(midnightStart);
			expect(mockTimestampFromDate).toHaveBeenCalledWith(midnightEnd);
		});

		it("handles dates at end of day correctly", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const lateStart = new Date("2025-12-15T23:00:00");
			const lateEnd = new Date("2025-12-15T23:59:59");

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: lateStart,
				newEndTime: lateEnd,
			});

			expect(mockTimestampFromDate).toHaveBeenCalledWith(lateStart);
			expect(mockTimestampFromDate).toHaveBeenCalledWith(lateEnd);
		});

		it("handles dates spanning multiple days", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const startDate = new Date("2025-12-15T22:00:00");
			const endDate = new Date("2025-12-16T02:00:00");

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: startDate,
				newEndTime: endDate,
			});

			expect(mockUpdateDoc).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					startTime: expect.objectContaining({
						seconds: Math.floor(startDate.getTime() / 1000),
					}),
					endTime: expect.objectContaining({
						seconds: Math.floor(endDate.getTime() / 1000),
					}),
				}),
			);
		});

		it("preserves millisecond precision in timestamp conversion", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const preciseStart = new Date("2025-12-15T10:30:45.123");
			const preciseEnd = new Date("2025-12-15T11:30:45.456");

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: preciseStart,
				newEndTime: preciseEnd,
			});

			// Verify the exact Date objects were passed to Timestamp.fromDate
			expect(mockTimestampFromDate).toHaveBeenCalledWith(preciseStart);
			expect(mockTimestampFromDate).toHaveBeenCalledWith(preciseEnd);
		});
	});

	describe("edge cases", () => {
		it("handles empty string appointment ID", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			await rescheduleAppointment({
				appointmentId: "",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			// Firestore will be called - validation is handled by Firestore itself
			expect(mockDoc).toHaveBeenCalledWith({ type: "firestore" }, "appointments", "");
		});

		it("handles very long appointment ID", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);
			const longId = "a".repeat(1000);

			await rescheduleAppointment({
				appointmentId: longId,
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			expect(mockDoc).toHaveBeenCalledWith({ type: "firestore" }, "appointments", longId);
		});

		it("handles appointment ID with special characters", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);
			const specialId = "appt-123_test.appointment";

			await rescheduleAppointment({
				appointmentId: specialId,
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			expect(mockDoc).toHaveBeenCalledWith({ type: "firestore" }, "appointments", specialId);
		});

		it("handles same start and end time", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);
			const sameTime = new Date("2025-12-15T10:00:00");

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: sameTime,
				newEndTime: sameTime,
			});

			// Function doesn't validate - it just passes to Firestore
			expect(mockUpdateDoc).toHaveBeenCalled();
		});

		it("handles end time before start time", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T12:00:00"),
				newEndTime: new Date("2025-12-15T10:00:00"), // Before start
			});

			// Function doesn't validate order - it just passes to Firestore
			expect(mockUpdateDoc).toHaveBeenCalled();
		});

		it("handles dates in the past", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: new Date("2020-01-01T10:00:00"),
				newEndTime: new Date("2020-01-01T11:00:00"),
			});

			// Function doesn't validate date range - it just passes to Firestore
			expect(mockUpdateDoc).toHaveBeenCalled();
		});

		it("handles dates far in the future", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const futureStart = new Date("2099-12-31T10:00:00");
			const futureEnd = new Date("2099-12-31T11:00:00");

			await rescheduleAppointment({
				appointmentId: "appointment-123",
				newStartTime: futureStart,
				newEndTime: futureEnd,
			});

			expect(mockTimestampFromDate).toHaveBeenCalledWith(futureStart);
			expect(mockTimestampFromDate).toHaveBeenCalledWith(futureEnd);
		});
	});

	describe("concurrent operations", () => {
		it("can handle multiple sequential reschedule calls", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			await rescheduleAppointment({
				appointmentId: "appointment-1",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await rescheduleAppointment({
				appointmentId: "appointment-2",
				newStartTime: new Date("2025-12-16T14:00:00"),
				newEndTime: new Date("2025-12-16T15:00:00"),
			});

			expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
			expect(mockDoc).toHaveBeenCalledWith({ type: "firestore" }, "appointments", "appointment-1");
			expect(mockDoc).toHaveBeenCalledWith({ type: "firestore" }, "appointments", "appointment-2");
		});

		it("can handle parallel reschedule calls", async () => {
			mockUpdateDoc.mockResolvedValue(undefined);

			const results = await Promise.all([
				rescheduleAppointment({
					appointmentId: "appointment-1",
					newStartTime: new Date("2025-12-15T10:00:00"),
					newEndTime: new Date("2025-12-15T11:00:00"),
				}),
				rescheduleAppointment({
					appointmentId: "appointment-2",
					newStartTime: new Date("2025-12-16T14:00:00"),
					newEndTime: new Date("2025-12-16T15:00:00"),
				}),
			]);

			expect(results).toEqual([undefined, undefined]);
			expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
		});
	});
});
