import { useState } from "react";
import { Pencil } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import type { ProfileResult, ProfileRow } from "../../services/profileService";
import { track } from "../../lib/analytics";

export interface ProfileHeaderProps {
	profile: ProfileRow | null;
	user: User;
	onSaveName: (name: string) => Promise<ProfileResult<string>>;
}

// Family-dialog morph (motion.dev/examples/react-family-dialog): the view and
// edit states share one `layoutId`, so the container springs from one shape to
// the other while their contents crossfade — the trigger "grows" into the form
// rather than swapping. A low-bounce spring is the example's signature feel.
const FAMILY_MORPH_TRANSITION = { type: "spring", bounce: 0, duration: 0.5 } as const;
const FAMILY_MORPH_TRANSITION_REDUCED = { duration: 0.15 } as const;
const NAME_PANEL_LAYOUT_ID = "profile-name-panel";

/** Google-seeded avatar + display name with inline editing. */
export default function ProfileHeader({ profile, user, onSaveName }: ProfileHeaderProps) {
	const [isEditing, setIsEditing] = useState(false);
	const prefersReducedMotion = useReducedMotion();
	const morphTransition = prefersReducedMotion ? FAMILY_MORPH_TRANSITION_REDUCED : FAMILY_MORPH_TRANSITION;
	const [draft, setDraft] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const displayName = profile?.display_name ?? "";
	const initial = (displayName || user.email || "?").trim().charAt(0).toUpperCase();

	const startEditing = () => {
		setDraft(displayName);
		setError(null);
		setIsEditing(true);
	};

	const handleSave = async () => {
		setIsSaving(true);
		setError(null);
		const result = await onSaveName(draft);
		setIsSaving(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		track("profile_name_confirmed", { edited: true });
		setIsEditing(false);
	};

	return (
		<MotionConfig transition={morphTransition}>
			<div className="profile__header">
				{profile?.photo_url ? (
					<img className="profile__avatar profile__avatar--photo" src={profile.photo_url} alt="" />
				) : (
					<div className="profile__avatar" aria-hidden="true">
						{initial}
					</div>
				)}

				{/* Shared `layoutId` on both states = the family-dialog morph: framer
				    springs the panel between the two shapes and crossfades their
				    contents, so the pencil "expands" into the edit form. */}
				<AnimatePresence mode="popLayout" initial={false}>
					{isEditing ? (
						<motion.div key="edit" layoutId={NAME_PANEL_LAYOUT_ID} className="profile__name-edit">
							<input
								type="text"
								className="profile__name-input"
								aria-label="Your name"
								value={draft}
								onChange={(event) => {
									setDraft(event.target.value);
									setError(null);
								}}
								disabled={isSaving}
							/>
							{error && (
								<p className="profile__error" role="alert">
									{error}
								</p>
							)}
							<div className="profile__name-actions">
								<button type="button" className="profile__name-save" onClick={() => void handleSave()} disabled={isSaving}>
									Save
								</button>
								<button
									type="button"
									className="profile__name-cancel"
									onClick={() => setIsEditing(false)}
									disabled={isSaving}
								>
									Cancel
								</button>
							</div>
						</motion.div>
					) : (
						<motion.div key="view" layoutId={NAME_PANEL_LAYOUT_ID} className="profile__name-view">
							<h1 className="profile__name">
								{displayName || "Add your name"}
								<button type="button" className="profile__name-edit-btn" aria-label="Edit name" onClick={startEditing}>
									<Pencil size={13} aria-hidden="true" />
								</button>
							</h1>
							<p className="profile__meta">{user.email}</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</MotionConfig>
	);
}
