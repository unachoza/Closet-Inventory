import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./tokens.css"; // canonical design tokens — imported first so the cascade resolves
import "./styles/primitives.css"; // canonical component primitives (.btn/.panel/.field/.pill)
import "./index.css";
import "./styles/typography.css"; // editorial type adoption — loads AFTER index.css to win the cascade
import App from "./App.tsx";
import { setupInstallPromptCapture } from "./hooks/useInstallPrompt";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

// beforeinstallprompt fires before React mounts — capture it at module scope.
setupInstallPromptCapture();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={clientId}>
			<App />
		</GoogleOAuthProvider>
	</StrictMode>,
);
