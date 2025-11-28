import { describe, it, expect, vi, beforeEach } from "vitest";
import { assignArtist } from "./assignArtist";
import { getDocs, type QuerySnapshot, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import type { Artist } from "../hooks/useArtists";
import type { UserRole } from "@/features/users";

// Mock Firestore
vi.mock("firebase/firestore", () => ({
	collection: vi.fn(),
	query: vi.fn(),
	where: vi.fn(),
	getDocs: vi.fn(),
	Timestamp: {
		fromDate: (date: Date) => ({
			toDate: () => date,
		}),
	},
}));

vi.mock("@/lib/firebase", () => ({
	db: {},
}));

// Mock data
const mockArtists: Artist[] = [
	{ id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "artist" as UserRole },
	{ id: "2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "artist" as UserRole },
];

const createMockAppointment = (artistId: string, start: Date, end: Date, status = "upcoming") =>
	({
		data: () => ({
			artistId,
			startTime: { toDate: () => start },
			endTime: { toDate: () => end },
			status,
		}),
	}) as unknown as QueryDocumentSnapshot<DocumentData, DocumentData>;

describe("assignArtist", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("assigns the first available artist when no overlaps exist", async () => {
		vi.mocked(getDocs).mockResolvedValue({
			docs: [], // No existing appointments
		} as unknown as QuerySnapshot<DocumentData, DocumentData>);

		const startTime = new Date("2024-07-15T10:00:00");
		const endTime = new Date("2024-07-15T11:00:00");

		const assigned = await assignArtist(startTime, endTime, mockArtists);

		expect(assigned).toEqual(mockArtists[0]);
	});

	it("skips an artist if they have an overlapping appointment", async () => {
		const startTime = new Date("2024-07-15T10:00:00");
		const endTime = new Date("2024-07-15T11:00:00");

		// Artist 1 has an appointment at the same time
		vi.mocked(getDocs).mockResolvedValue({
			docs: [createMockAppointment("1", startTime, endTime)],
		} as unknown as QuerySnapshot<DocumentData, DocumentData>);

		const assigned = await assignArtist(startTime, endTime, mockArtists);

		expect(assigned).toEqual(mockArtists[1]); // Should assign Artist 2
	});

	it("returns null if all artists are busy", async () => {
		const startTime = new Date("2024-07-15T10:00:00");
		const endTime = new Date("2024-07-15T11:00:00");

		// Both artists have appointments
		vi.mocked(getDocs).mockResolvedValue({
			docs: [createMockAppointment("1", startTime, endTime), createMockAppointment("2", startTime, endTime)],
		} as unknown as QuerySnapshot<DocumentData, DocumentData>);

		const assigned = await assignArtist(startTime, endTime, mockArtists);

		expect(assigned).toBeNull();
	});

	it("ignores cancelled appointments when checking for overlap", async () => {
		const startTime = new Date("2024-07-15T10:00:00");
		const endTime = new Date("2024-07-15T11:00:00");

		// Artist 1 has a CANCELLED appointment at the same time
		vi.mocked(getDocs).mockResolvedValue({
			docs: [createMockAppointment("1", startTime, endTime, "cancelled")],
		} as unknown as QuerySnapshot<DocumentData, DocumentData>);

		const assigned = await assignArtist(startTime, endTime, mockArtists);

		expect(assigned).toEqual(mockArtists[0]); // Should still assign Artist 1
	});

	it("detects partial overlaps correctly", async () => {
		const startTime = new Date("2024-07-15T10:00:00");
		const endTime = new Date("2024-07-15T12:00:00");

		// Artist 1 has appointment 11:00 - 13:00 (Overlaps end of requested slot)
		const overlapStart = new Date("2024-07-15T11:00:00");
		const overlapEnd = new Date("2024-07-15T13:00:00");

		vi.mocked(getDocs).mockResolvedValue({
			docs: [createMockAppointment("1", overlapStart, overlapEnd)],
		} as unknown as QuerySnapshot<DocumentData, DocumentData>);

		const assigned = await assignArtist(startTime, endTime, mockArtists);

		expect(assigned).toEqual(mockArtists[1]);
	});
});
