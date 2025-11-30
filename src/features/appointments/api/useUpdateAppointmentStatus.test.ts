import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useUpdateAppointmentStatus } from "./useUpdateAppointmentStatus";
import React from "react";

// Mock firebase/firestore
const mockGetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteField = vi.fn(() => "DELETE_FIELD_SENTINEL");

vi.mock("firebase/firestore", () => ({
	doc: vi.fn(() => ({ id: "test-appointment-id" })),
	getDoc: (...args: unknown[]) => mockGetDoc(...args),
	updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
	deleteField: () => mockDeleteField(),
}));

// Mock firebase/storage
const mockDeleteObject = vi.fn();

vi.mock("firebase/storage", () => ({
	ref: vi.fn((_, url) => ({ fullPath: url })),
	deleteObject: (...args: unknown[]) => mockDeleteObject(...args),
}));

// Mock firebase
vi.mock("@/lib/firebase", () => ({
	db: {},
	storage: {},
}));

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client: queryClient }, children);
	};
}

describe("useUpdateAppointmentStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("deletes reference images when cancelling a pending appointment", async () => {
		const referenceImageUrls = ["https://storage.example.com/image1.jpg", "https://storage.example.com/image2.jpg"];

		mockGetDoc.mockResolvedValue({
			data: () => ({
				status: "pending",
				referenceImageUrls,
			}),
		});
		mockUpdateDoc.mockResolvedValue(undefined);
		mockDeleteObject.mockResolvedValue(undefined);

		const { result } = renderHook(() => useUpdateAppointmentStatus(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			appointmentId: "test-appointment-id",
			status: "cancelled",
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify images were deleted
		expect(mockDeleteObject).toHaveBeenCalledTimes(2);

		// Verify status was updated and referenceImageUrls was removed
		expect(mockUpdateDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				status: "cancelled",
				referenceImageUrls: "DELETE_FIELD_SENTINEL",
			}),
		);
	});

	it("does NOT delete reference images when cancelling a non-pending appointment", async () => {
		const referenceImageUrls = ["https://storage.example.com/image1.jpg"];

		mockGetDoc.mockResolvedValue({
			data: () => ({
				status: "upcoming", // Not pending
				referenceImageUrls,
			}),
		});
		mockUpdateDoc.mockResolvedValue(undefined);

		const { result } = renderHook(() => useUpdateAppointmentStatus(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			appointmentId: "test-appointment-id",
			status: "cancelled",
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify images were NOT deleted
		expect(mockDeleteObject).not.toHaveBeenCalled();

		// Verify only status was updated (no deleteField for referenceImageUrls)
		expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), { status: "cancelled" });
	});

	it("still updates appointment status even if image deletion fails", async () => {
		const referenceImageUrls = ["https://storage.example.com/image1.jpg"];

		mockGetDoc.mockResolvedValue({
			data: () => ({
				status: "pending",
				referenceImageUrls,
			}),
		});
		mockDeleteObject.mockRejectedValue(new Error("Storage error"));
		mockUpdateDoc.mockResolvedValue(undefined);

		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { result } = renderHook(() => useUpdateAppointmentStatus(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			appointmentId: "test-appointment-id",
			status: "cancelled",
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify deleteObject was attempted
		expect(mockDeleteObject).toHaveBeenCalled();

		// Verify error was logged
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining("Failed to delete image"),
			expect.any(Error),
		);

		// Verify appointment was still updated despite image deletion failure
		expect(mockUpdateDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				status: "cancelled",
				referenceImageUrls: "DELETE_FIELD_SENTINEL",
			}),
		);

		consoleErrorSpy.mockRestore();
	});

	it("removes referenceImageUrls field from document when cancelling pending appointment", async () => {
		mockGetDoc.mockResolvedValue({
			data: () => ({
				status: "pending",
				referenceImageUrls: ["https://storage.example.com/image1.jpg"],
			}),
		});
		mockUpdateDoc.mockResolvedValue(undefined);
		mockDeleteObject.mockResolvedValue(undefined);

		const { result } = renderHook(() => useUpdateAppointmentStatus(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			appointmentId: "test-appointment-id",
			status: "cancelled",
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify deleteField was called and used in updateDoc
		expect(mockDeleteField).toHaveBeenCalled();
		expect(mockUpdateDoc).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				referenceImageUrls: "DELETE_FIELD_SENTINEL",
			}),
		);
	});

	it("does not delete images when approving an appointment", async () => {
		mockGetDoc.mockResolvedValue({
			data: () => ({
				status: "pending",
				referenceImageUrls: ["https://storage.example.com/image1.jpg"],
			}),
		});
		mockUpdateDoc.mockResolvedValue(undefined);

		const { result } = renderHook(() => useUpdateAppointmentStatus(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			appointmentId: "test-appointment-id",
			status: "upcoming", // Approving, not cancelling
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify images were NOT deleted when approving
		expect(mockDeleteObject).not.toHaveBeenCalled();

		// Verify only status was updated (referenceImageUrls preserved by Firestore's updateDoc behavior)
		expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), { status: "upcoming" });
	});

	it("preserves referenceImageUrls when approving a pending appointment", async () => {
		mockGetDoc.mockResolvedValue({
			data: () => ({
				status: "pending",
				referenceImageUrls: [
					"https://storage.example.com/image1.jpg",
					"https://storage.example.com/image2.jpg",
				],
			}),
		});
		mockUpdateDoc.mockResolvedValue(undefined);

		const { result } = renderHook(() => useUpdateAppointmentStatus(), {
			wrapper: createWrapper(),
		});

		result.current.mutate({
			appointmentId: "test-appointment-id",
			status: "upcoming",
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Verify deleteField was NOT called - referenceImageUrls should be preserved
		expect(mockDeleteField).not.toHaveBeenCalled();

		// Verify updateDoc was called with ONLY status, not touching referenceImageUrls
		// This ensures Firestore's partial update behavior preserves the field
		const updateDocCall = mockUpdateDoc.mock.calls[0][1];
		expect(updateDocCall).toEqual({ status: "upcoming" });
		expect(updateDocCall).not.toHaveProperty("referenceImageUrls");
	});
});
