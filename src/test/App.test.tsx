import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("App", () => {
	it("renders hello world", () => {
		render(<div>Hello World</div>);
		expect(screen.getByText("Hello World")).toBeInTheDocument();
	});
});
