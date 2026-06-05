import { useState } from "react";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "../../firebase";
import type { User } from "firebase/auth";
import "./EmailAuth.css";

type Mode = "signin" | "signup";

const FIREBASE_ERRORS: Record<string, string> = {
	"auth/invalid-email": "That doesn't look like a valid email address.",
	"auth/user-not-found": "No account found with that email.",
	"auth/wrong-password": "Incorrect password.",
	"auth/email-already-in-use": "An account with that email already exists.",
	"auth/weak-password": "Password must be at least 6 characters.",
	"auth/too-many-requests": "Too many attempts. Try again later.",
	"auth/invalid-credential": "Incorrect email or password.",
};

const EmailAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [mode, setMode] = useState<Mode>("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const action =
				mode === "signup"
					? createUserWithEmailAndPassword(auth, email, password)
					: signInWithEmailAndPassword(auth, email, password);

			const result = await action;
			setUser(result.user);
		} catch (err: unknown) {
			const code = (err as { code?: string }).code ?? "";
			setError(FIREBASE_ERRORS[code] ?? "Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleSignOut = async () => {
		await signOut(auth);
		setUser(null);
		setEmail("");
		setPassword("");
	};

	if (user) {
		return (
			<div className="email-auth">
				<div className="email-auth__card">
					<div className="email-auth__avatar">
						{user.email?.[0].toUpperCase() ?? "?"}
					</div>
					<h2 className="email-auth__title">You're signed in</h2>
					<p className="email-auth__subtitle">{user.email}</p>
					<button className="email-auth__btn" onClick={handleSignOut}>
						Sign Out
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="email-auth">
			<div className="email-auth__card">
				<h2 className="email-auth__title">
					{mode === "signin" ? "Sign in" : "Create account"}
				</h2>
				<p className="email-auth__subtitle">
					{mode === "signin"
						? "Sign in to sync your closet across devices."
						: "Create an account to save your closet."}
				</p>

				<form className="email-auth__form" onSubmit={handleSubmit} noValidate>
					<label className="email-auth__label">
						Email
						<input
							className="email-auth__input"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@hotmail.com"
							autoComplete="email"
							required
						/>
					</label>

					<label className="email-auth__label">
						Password
						<input
							className="email-auth__input"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={mode === "signup" ? "At least 6 characters" : "Password"}
							autoComplete={mode === "signup" ? "new-password" : "current-password"}
							required
						/>
					</label>

					{error && <p className="email-auth__error">{error}</p>}

					<button className="email-auth__btn" type="submit" disabled={loading}>
						{loading
							? mode === "signin" ? "Signing in…" : "Creating account…"
							: mode === "signin" ? "Sign In" : "Create Account"}
					</button>
				</form>

				<button
					className="email-auth__toggle"
					type="button"
					onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
				>
					{mode === "signin"
						? "Don't have an account? Sign up"
						: "Already have an account? Sign in"}
				</button>
			</div>
		</div>
	);
};

export default EmailAuth;
