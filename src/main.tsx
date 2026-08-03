import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./tokens.css"; // canonical design tokens — imported first so the cascade resolves
import "./styles/fonts.css"; // self-hosted @font-face rules — before anything that uses them
import "./styles/primitives.css"; // canonical component primitives (.btn/.panel/.field/.pill)
import "./index.css";
import "./styles/typography.css"; // editorial type adoption — loads AFTER index.css to win the cascade
import App from "./App.tsx";
import { setupInstallPromptCapture } from "./hooks/useInstallPrompt";
import { initErrorTracking } from "./lib/monitoring";
import { setupPwaUpdateCheck } from "./lib/pwaUpdate";
import { setupPwaInstallTracking } from "./lib/pwaInstallTracking";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

// beforeinstallprompt fires before React mounts — capture it at module scope.
setupInstallPromptCapture();

// appinstalled fires once, reliably, whenever the browser actually completes
// an install — the only real "this became an installed PWA" signal we have.
setupPwaInstallTracking();

// Registers the service worker and forces a re-check on visibilitychange, so a
// backgrounded-then-reopened install picks up a new build without needing a
// fresh navigation (see pwaUpdate.ts). No-ops harmlessly outside a built PWA.
setupPwaUpdateCheck();

// Crash reporting starts before React mounts so a failure during the very first
// render is reported rather than lost. Analytics stays consent-gated and is
// started separately by the consent banner.
void initErrorTracking();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={clientId}>
			<App />
		</GoogleOAuthProvider>
	</StrictMode>,
);
