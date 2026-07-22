import { useEffect, useRef, useState } from "react";
import OnboardingShell from "../OnboardingShell";
import { useProfile } from "../../../hooks/useProfile";
import { useSupabaseAuthContext } from "../../../context/SupabaseAuthContext";
import { validateDisplayName } from "../../../services/profileService";
import { track } from "../../../lib/analytics";

export interface NameStepProps {
	onContinue: () => void;
}

/**
 * "What should we call you?" — pre-filled from the Google-seeded profile so
 * most people confirm with one tap. A failed save never traps the user here;
 * the name stays editable later in the profile page.
 */
export default function NameStep({ onContinue }: NameStepProps) {
	const { user } = useSupabaseAuthContext();
	const { profile, updateDisplayName } = useProfile();
	const [name, setName] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saveFailed, setSaveFailed] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const seededRef = useRef<string>("");

	useEffect(() => {
		if (name !== null) return;
		const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string };
		const seeded = profile?.display_name ?? meta.full_name ?? meta.name ?? null;
		if (seeded !== null) {
			seededRef.current = seeded.split(" ")[0];
			setName(seeded);
		} else if (profile) {
			setName("");
		}
	}, [profile, user, name]);

	const handleConfirm = async () => {
		const validated = validateDisplayName(name ?? "");
		if (!validated.ok) {
			setError(validated.error);
			return;
		}
		const edited = validated.value !== seededRef.current;
		if (profile?.display_name?.trim() === validated.value) {
			track("profile_name_confirmed", { edited });
			onContinue();
			return;
		}
		setIsSaving(true);
		setError(null);
		const result = await updateDisplayName(validated.value);
		setIsSaving(false);
		if (!result.ok) {
			setError(result.error);
			setSaveFailed(true);
			return;
		}
		track("profile_name_confirmed", { edited });
		onContinue();
	};

	return (
		<OnboardingShell
			cta={{ label: "That's me", onClick: () => void handleConfirm(), disabled: isSaving }}
			skip={saveFailed ? { label: "Continue anyway", onClick: onContinue } : undefined}
		>
			<div className="onb-step">
				<h1 className="onb-step__title">
					What should <em>we call you?</em>
				</h1>
				<input
					type="text"
					className="onb__name-input"
					aria-label="Your name"
					value={name?.split(" ")[0] ?? ""}
					onChange={(event) => {
						setName(event.target.value);
						setError(null);
					}}
				/>
				{error && (
					<p className="onb__error" role="alert">
						{error}
					</p>
				)}
				<p className="onb__hint">From your Google account — change it anytime in your profile.</p>
			</div>
		</OnboardingShell>
	);
}
