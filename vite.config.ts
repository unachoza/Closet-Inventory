/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(() => ({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		css: true,
		setupFiles: "./src/testSetup.ts",
		// e2e/ holds Playwright specs (own runner) — keep them out of Vitest.
		exclude: ["**/node_modules/**", "**/.claude/**", "**/e2e/**"],
	},
}));
