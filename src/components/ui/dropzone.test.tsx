import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "./dropzone";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { toast } from "sonner";

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		warning: vi.fn(),
	},
}));

describe("Dropzone", () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		// Suppress console errors/warnings from File object circular references during tests
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
		consoleWarnSpy.mockRestore();
	});

	it("renders correctly", () => {
		render(<Dropzone />);
		expect(screen.getByText("Upload reference images")).toBeInTheDocument();
	});

	it("accepts files within size limit", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		render(<Dropzone onChange={handleChange} />);

		const file = new File(["content"], "test.png", { type: "image/png" });
		const input = screen.getByTestId("dropzone-input");

		await user.upload(input, file);

		expect(handleChange).toHaveBeenCalledWith([file]);
		expect(screen.getByText("test.png")).toBeInTheDocument();
	});

	it("rejects oversized files and shows error toast", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		const maxSize = 10; // 10 bytes
		render(<Dropzone onChange={handleChange} maxSize={maxSize} />);

		const file = new File(["this content is definitely larger than 10 bytes"], "large.png", { type: "image/png" });
		const input = screen.getByTestId("dropzone-input");

		await user.upload(input, file);

		expect(handleChange).not.toHaveBeenCalled();
		expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("is too large"));
		expect(screen.queryByText("large.png")).not.toBeInTheDocument();
	});

	it("disables input when max files reached", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		const maxFiles = 1;
		const { rerender } = render(<Dropzone onChange={handleChange} maxFiles={maxFiles} />);

		const file1 = new File(["content"], "test1.png", { type: "image/png" });
		const input = screen.getByTestId("dropzone-input");

		await user.upload(input, file1);

		expect(handleChange).toHaveBeenCalledWith([file1]);

		// Re-render with the new value to simulate parent state update
		rerender(<Dropzone onChange={handleChange} maxFiles={maxFiles} value={[file1]} />);

		expect(screen.getByText("Limit reached")).toBeInTheDocument();
		expect(input).toBeDisabled();
	});

	it("shows warning when trying to add more than remaining slots", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		const maxFiles = 2;
		render(<Dropzone onChange={handleChange} maxFiles={maxFiles} />);

		const file1 = new File(["c1"], "1.png", { type: "image/png" });
		const file2 = new File(["c2"], "2.png", { type: "image/png" });
		const file3 = new File(["c3"], "3.png", { type: "image/png" });

		const input = screen.getByTestId("dropzone-input");

		await user.upload(input, [file1, file2, file3]);

		expect(handleChange).toHaveBeenCalledWith([file1, file2]); // Should only take first 2
		expect(toast.warning).toHaveBeenCalledWith(expect.stringContaining("You can only add 2 more file(s)"));
	});
});
