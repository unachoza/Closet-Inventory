/// <reference types="vitest" />
/// <reference types="vite/client" />

import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json" with { type: "json" };

// Build-time version string surfaced in Settings + tagged into Sentry/PostHog,
// so a bug report reads "crashed on v0.9.12-a1b2c3d" instead of "broke yesterday".
// Git may be absent (some CI checkouts) — fall back to just the package version.
function resolveAppVersion(): string {
	try {
		const sha = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
			.toString()
			.trim();
		return `v${pkg.version}-${sha}`;
	} catch {
		return `v${pkg.version}`;
	}
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
	define: {
		__APP_VERSION__: JSON.stringify(resolveAppVersion()),
	},
	build: {
		// Emit CSS that older mobile Safari can parse. Without this, esbuild
		// minifies media queries to the Level-4 range syntax — `@media (width<=768px)`
		// — which Safari only understands from 16.4+. On a tester's iPhone running an
		// older iOS, every `@media (--bp-*)` block was dropped, so the phone rendered
		// the *desktop* layout (e.g. the two-pane email view). Pinning cssTarget to a
		// pre-16.4 Safari keeps the classic `(max-width: 768px)` syntax those browsers
		// support. (JS target is left at Vite's default.)
		cssTarget: ["chrome87", "edge88", "firefox78", "safari14"],
	},
	plugins: [
		react(),
		// E5-2.1/2.2 — installable PWA shell. The service worker precaches the
		// built app shell (HTML/JS/CSS/icons) so the app boots offline; closet
		// DATA comes from localStorage via useCloudCloset (E1-1.6), NOT from SW
		// response caching. Deliberately NO runtimeCaching for *.supabase.co —
		// caching auth/REST responses risks stale rows and leaked sessions.
		VitePWA({
			registerType: "autoUpdate",
			// SW only in `build`/`preview` (default) — dev + Playwright (which
			// runs against the dev server) stay SW-free and deterministic.
			devOptions: { enabled: false },
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],
			manifest: {
				name: "Nothing To Wear",
				short_name: "NTW",
				description: "Your closet, inventoried — track, import, and rediscover what you own.",
				start_url: "/",
				display: "standalone",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				icons: [
					{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
					{ src: "maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
				// The main JS chunk is ~1MB; default 2MB cap is fine today but
				// set explicitly so a future chunk-size bump fails loudly here
				// (in config review) rather than silently skipping precache.
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
			},
		}),
	],
	test: {
		globals: true,
		environment: "jsdom",
		css: true,
		setupFiles: "./src/testSetup.ts",
		exclude: ["**/node_modules/**", "**/.claude/**", "**/e2e/**"],
	},
}));
