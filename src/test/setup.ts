import "@testing-library/jest-dom";

// Suppress Vite's source map RangeError noise in test output
// This is a known Vite issue when formatting stack traces with circular references
const originalError = console.error;
console.error = (...args: unknown[]) => {
	const message = args[0];
	if (typeof message === "object" && message instanceof RangeError && message.message.includes("call stack")) {
		return; // Suppress Vite source map stack overflow errors
	}
	originalError.apply(console, args);
};
