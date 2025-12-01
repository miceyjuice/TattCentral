import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";

// Mock Firebase to prevent actual Firebase initialization
vi.mock("@/lib/firebase", () => ({
	auth: {},
	db: {},
	storage: {},
}));

// Mock firebase/auth
vi.mock("firebase/auth", () => ({
	onAuthStateChanged: vi.fn((_, callback) => {
		// Simulate no user logged in
		callback(null);
		return () => {};
	}),
	signInWithPopup: vi.fn(),
	GoogleAuthProvider: vi.fn(),
	signOut: vi.fn(),
}));

// Mock firebase/firestore
vi.mock("firebase/firestore", () => ({
	doc: vi.fn(),
	getDoc: vi.fn(() =>
		Promise.resolve({
			exists: () => false,
			data: () => null,
		}),
	),
	collection: vi.fn(),
}));

// Mock sonner to avoid toast-related issues
vi.mock("sonner", () => ({
	Toaster: () => null,
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
}

function renderApp() {
	const queryClient = createTestQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<App />
			</AuthProvider>
		</QueryClientProvider>,
	);
}

describe("App", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset window location to root
		window.history.pushState({}, "", "/");
	});

	it("renders landing page at root route", () => {
		renderApp();
		// The landing page should render - check for booking link
		expect(screen.getByRole("link", { name: /book now/i })).toBeInTheDocument();
	});

	it("renders login page at /login route", () => {
		window.history.pushState({}, "", "/login");
		renderApp();
		// Login page shows "Admin Access" heading and has Sign in button
		expect(screen.getByRole("heading", { name: /admin access/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
	});
});
