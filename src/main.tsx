import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./tokens.css"; // canonical design tokens — imported first so the cascade resolves
import "./styles/primitives.css"; // canonical component primitives (.btn/.panel/.field/.pill)
import "./index.css";
import App from "./App.tsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={clientId}>
			<App />
		</GoogleOAuthProvider>
	</StrictMode>,
);
