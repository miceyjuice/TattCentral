/* eslint-disable react-refresh/only-export-components */
/**
 * Centralized test utilities for consistent testing patterns.
 *
 * This module provides:
 * - Custom render function with pre-configured providers
 * - Reusable test helpers for common UI patterns (calendar, loading states)
 * - Standard mock factories for consistent test data
 */
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, type BrowserRouterProps } from "react-router-dom";
import { type ReactElement, type ReactNode } from "react";

// ============================================================================
// Provider Setup
// ============================================================================

/**
 * Creates a fresh QueryClient configured for testing.
 * Disables retries and garbage collection to make tests deterministic.
 */
export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: Infinity,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

interface AllProvidersProps {
	children: ReactNode;
	routerProps?: BrowserRouterProps;
}

/**
 * Wraps children with all necessary providers for integration tests.
 */
function AllProviders({ children, routerProps }: AllProvidersProps) {
	const queryClient = createTestQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter {...routerProps}>{children}</BrowserRouter>
		</QueryClientProvider>
	);
}

// ============================================================================
// Custom Render
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	routerProps?: BrowserRouterProps;
}

/**
 * Custom render function that wraps component with all providers.
 * Also sets up userEvent for realistic user interactions.
 *
 * @example
 * ```ts
 * const { user } = renderWithProviders(<MyComponent />);
 * await user.click(screen.getByRole('button'));
 * ```
 */
export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
	const { routerProps, ...renderOptions } = options;

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<AllProviders routerProps={routerProps}>{children}</AllProviders>
	);

	return {
		user: userEvent.setup(),
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	};
}

// ============================================================================
// Calendar Test Helpers
// ============================================================================

/**
 * Selects a date in a calendar component using the data-day attribute.
 * This is the most reliable way to select dates as it doesn't depend on
 * visual text which can match multiple elements (e.g., "15" appears in headers).
 *
 * Note: The calendar component uses `toLocaleDateString()` for the data-day
 * attribute, so the format will vary by locale (e.g., "15.06.2024" or "6/15/2024").
 *
 * @param date - A Date object for the day to select
 * @param user - The userEvent instance
 *
 * @example
 * ```ts
 * const user = userEvent.setup();
 * await selectCalendarDate(new Date(2024, 5, 15), user);
 * ```
 */
export async function selectCalendarDate(date: Date, user: ReturnType<typeof userEvent.setup>) {
	const dataDay = date.toLocaleDateString();
	const dayButton = document.querySelector(`[data-day="${dataDay}"]`);

	if (!dayButton) {
		throw new Error(`Calendar date not found: ${dataDay}. Make sure the calendar is open and the date is visible.`);
	}

	await user.click(dayButton);
}

/**
 * Gets the data-day attribute string for a given date.
 * Uses toLocaleDateString() to match the calendar component's format.
 */
export function getDataDayAttribute(date: Date): string {
	return date.toLocaleDateString();
}

// ============================================================================
// Loading State Helpers
// ============================================================================

/**
 * Finds a loading spinner by its accessible role.
 * Components should use role="status" with aria-label for accessibility.
 *
 * @param label - The aria-label of the loading indicator (optional)
 */
export function findLoadingSpinner(label?: string): HTMLElement | null {
	if (label) {
		return document.querySelector(`[role="status"][aria-label="${label}"]`);
	}
	return document.querySelector('[role="status"]');
}

/**
 * Checks if a loading spinner is present in the document.
 * Falls back to checking for animate-spin class if no role="status" is found.
 */
export function isLoading(): boolean {
	return !!document.querySelector('[role="status"]') || !!document.querySelector(".animate-spin");
}

// ============================================================================
// Wait Utilities
// ============================================================================

/**
 * Waits for loading state to disappear.
 * Useful for integration tests that need to wait for async operations.
 */
export async function waitForLoadingToFinish() {
	// Wait a tick for any pending state updates
	await new Promise((resolve) => setTimeout(resolve, 0));
}

// ============================================================================
// Mock Factories
// ============================================================================

/**
 * Creates a mock appointment for testing.
 */
export function createMockAppointment(overrides = {}) {
	return {
		id: "test-appointment-id",
		clientName: "Test Client",
		clientEmail: "test@example.com",
		clientPhone: "500 123 456",
		description: "Test tattoo description",
		type: "Small Tattoo",
		status: "pending" as const,
		date: new Date(),
		startTime: new Date(),
		endTime: new Date(),
		artistId: "artist-1",
		referenceImageUrls: [],
		...overrides,
	};
}

/**
 * Creates a mock artist for testing.
 */
export function createMockArtist(overrides = {}) {
	return {
		id: "artist-1",
		firstName: "John",
		lastName: "Doe",
		email: "john@example.com",
		role: "artist" as const,
		...overrides,
	};
}

// Re-export everything from @testing-library/react for convenience
export * from "@testing-library/react";
export { userEvent };
