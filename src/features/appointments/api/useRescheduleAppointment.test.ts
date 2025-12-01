import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useRescheduleAppointment } from "./useRescheduleAppointment";
import { rescheduleAppointment } from "./rescheduleAppointment";
import { toast } from "sonner";
import React from "react";

// Mock the rescheduleAppointment API function
vi.mock("./rescheduleAppointment", () => ({
	rescheduleAppointment: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const mockRescheduleAppointment = vi.mocked(rescheduleAppointment);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
}

function createWrapper(queryClient: QueryClient) {
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client: queryClient }, children);
	};
}

describe("useRescheduleAppointment", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = createTestQueryClient();
	});

	describe("mutation success flow", () => {
		it("calls rescheduleAppointment with correct parameters", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			const newStartTime = new Date("2025-12-15T10:00:00");
			const newEndTime = new Date("2025-12-15T11:30:00");

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime,
				newEndTime,
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockRescheduleAppointment).toHaveBeenCalledWith(
				expect.objectContaining({
					appointmentId: "appointment-123",
					newStartTime,
					newEndTime,
				}),
				expect.anything(), // React Query passes additional context
			);
			expect(mockRescheduleAppointment).toHaveBeenCalledTimes(1);
		});

		it("returns isSuccess true after successful mutation", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			expect(result.current.isSuccess).toBe(false);
			expect(result.current.isPending).toBe(false);

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.isPending).toBe(false);
			expect(result.current.isError).toBe(false);
		});

		it("sets isPending true while mutation is in progress", async () => {
			let resolvePromise: () => void;
			const pendingPromise = new Promise<void>((resolve) => {
				resolvePromise = resolve;
			});
			mockRescheduleAppointment.mockReturnValue(pendingPromise);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isPending).toBe(true);
			});

			resolvePromise!();

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
				expect(result.current.isSuccess).toBe(true);
			});
		});
	});

	describe("query invalidation", () => {
		it("invalidates 'appointments' query on success", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["appointments"] });
		});

		it("invalidates 'appointment' query on success", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["appointment"] });
		});

		it("invalidates both appointment queries on success", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			// Both queries should be invalidated
			expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
		});

		it("does not invalidate queries on error", async () => {
			mockRescheduleAppointment.mockRejectedValue(new Error("Failed"));

			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(invalidateQueriesSpy).not.toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe("toast notifications", () => {
		it("shows success toast on successful reschedule", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockToastSuccess).toHaveBeenCalledWith("Appointment rescheduled successfully");
			expect(mockToastSuccess).toHaveBeenCalledTimes(1);
			expect(mockToastError).not.toHaveBeenCalled();
		});

		it("shows error toast on failed reschedule", async () => {
			mockRescheduleAppointment.mockRejectedValue(new Error("Network error"));

			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(mockToastError).toHaveBeenCalledWith("Failed to reschedule appointment. Please try again.");
			expect(mockToastError).toHaveBeenCalledTimes(1);
			expect(mockToastSuccess).not.toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it("does not show duplicate toasts on single mutation", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockToastSuccess).toHaveBeenCalledTimes(1);
		});
	});

	describe("error handling", () => {
		it("sets isError true when mutation fails", async () => {
			mockRescheduleAppointment.mockRejectedValue(new Error("Firestore error"));

			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.isSuccess).toBe(false);
			expect(result.current.error).toBeInstanceOf(Error);
			expect(result.current.error?.message).toBe("Firestore error");

			consoleErrorSpy.mockRestore();
		});

		it("logs error to console on failure", async () => {
			const testError = new Error("Permission denied");
			mockRescheduleAppointment.mockRejectedValue(testError);

			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to reschedule appointment:", testError);

			consoleErrorSpy.mockRestore();
		});

		it("handles network errors gracefully", async () => {
			mockRescheduleAppointment.mockRejectedValue(new Error("Network request failed"));

			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(mockToastError).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it("handles non-Error rejections", async () => {
			mockRescheduleAppointment.mockRejectedValue("String error");

			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to reschedule appointment:", "String error");
			expect(mockToastError).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe("integration with reschedule API", () => {
		it("passes through all parameters to the API function", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			const params = {
				appointmentId: "specific-appointment-id-12345",
				newStartTime: new Date("2025-06-20T14:30:00"),
				newEndTime: new Date("2025-06-20T16:00:00"),
			};

			result.current.mutate(params);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockRescheduleAppointment).toHaveBeenCalledWith(
				expect.objectContaining(params),
				expect.anything(), // React Query passes additional context
			);
		});

		it("can be called multiple times sequentially", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			// First mutation
			result.current.mutate({
				appointmentId: "appointment-1",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			// Reset for second mutation
			result.current.reset();

			// Second mutation
			result.current.mutate({
				appointmentId: "appointment-2",
				newStartTime: new Date("2025-12-16T14:00:00"),
				newEndTime: new Date("2025-12-16T15:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockRescheduleAppointment).toHaveBeenCalledTimes(2);
		});

		it("can retry after error with a new mutation call", async () => {
			mockRescheduleAppointment.mockRejectedValueOnce(new Error("First attempt failed"));
			mockRescheduleAppointment.mockResolvedValueOnce(undefined);

			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			// First attempt - fails
			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			// Second attempt - succeeds (calling mutate again resets the state)
			result.current.mutate({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.isError).toBe(false);

			consoleErrorSpy.mockRestore();
		});
	});

	describe("mutateAsync support", () => {
		it("supports async/await pattern with mutateAsync", async () => {
			mockRescheduleAppointment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			await result.current.mutateAsync({
				appointmentId: "appointment-123",
				newStartTime: new Date("2025-12-15T10:00:00"),
				newEndTime: new Date("2025-12-15T11:00:00"),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockRescheduleAppointment).toHaveBeenCalled();
		});

		it("throws error when using mutateAsync on failure", async () => {
			mockRescheduleAppointment.mockRejectedValue(new Error("Async error"));

			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() => useRescheduleAppointment(), {
				wrapper: createWrapper(queryClient),
			});

			await expect(
				result.current.mutateAsync({
					appointmentId: "appointment-123",
					newStartTime: new Date("2025-12-15T10:00:00"),
					newEndTime: new Date("2025-12-15T11:00:00"),
				}),
			).rejects.toThrow("Async error");

			consoleErrorSpy.mockRestore();
		});
	});
});
