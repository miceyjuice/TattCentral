/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Split vendor chunks for better caching
					"vendor-react": ["react", "react-dom", "react-router-dom"],
					"vendor-ui": [
						"@radix-ui/react-dialog",
						"@radix-ui/react-popover",
						"@radix-ui/react-select",
						"@radix-ui/react-slot",
						"@radix-ui/react-label",
						"@radix-ui/react-tooltip",
					],
					"vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
					"vendor-firebase-app": ["firebase/app"],
					"vendor-firebase-auth": ["firebase/auth"],
					"vendor-firebase-firestore": ["firebase/firestore"],
					"vendor-firebase-storage": ["firebase/storage"],
					"vendor-query": ["@tanstack/react-query"],
					"vendor-dates": ["date-fns", "react-day-picker", "react-datepicker"],
					"vendor-utils": ["class-variance-authority", "clsx", "tailwind-merge", "lucide-react"],
				},
			},
		},
	},
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: "./src/test/setup.ts",
	},
});
