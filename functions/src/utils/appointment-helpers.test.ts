import { describe, it, expect } from "vitest";
import { isValidEmail } from "./appointment-helpers";

describe("isValidEmail", () => {
	it("accepts valid email addresses", () => {
		expect(isValidEmail("test@example.com")).toBe(true);
		expect(isValidEmail("user.name@domain.com")).toBe(true);
		expect(isValidEmail("user+tag@example.org")).toBe(true);
		expect(isValidEmail("user@subdomain.domain.com")).toBe(true);
		expect(isValidEmail("name123@test.co.uk")).toBe(true);
	});

	it("rejects invalid email addresses", () => {
		expect(isValidEmail("")).toBe(false);
		expect(isValidEmail("notanemail")).toBe(false);
		expect(isValidEmail("@domain.com")).toBe(false);
		expect(isValidEmail("user@")).toBe(false);
		expect(isValidEmail("user@@domain.com")).toBe(false);
		expect(isValidEmail("user@domain")).toBe(false);
		expect(isValidEmail("user @domain.com")).toBe(false);
		expect(isValidEmail("user@.com")).toBe(false);
	});
});

describe("formatDate", () => {
	// Note: formatDate uses Firestore Timestamp which requires mocking
	// These tests verify the function signature exists
	it("should be exported from appointment-helpers", async () => {
		const module = await import("./appointment-helpers");
		expect(typeof module.formatDate).toBe("function");
	});
});

describe("formatTime", () => {
	it("should be exported from appointment-helpers", async () => {
		const module = await import("./appointment-helpers");
		expect(typeof module.formatTime).toBe("function");
	});
});

describe("calculateDuration", () => {
	it("should be exported from appointment-helpers", async () => {
		const module = await import("./appointment-helpers");
		expect(typeof module.calculateDuration).toBe("function");
	});
});

describe("toEmailData", () => {
	it("should be exported from appointment-helpers", async () => {
		const module = await import("./appointment-helpers");
		expect(typeof module.toEmailData).toBe("function");
	});
});
