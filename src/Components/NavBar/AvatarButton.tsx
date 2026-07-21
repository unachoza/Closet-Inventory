import { User as UserIcon } from "lucide-react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { useProfile } from "../../hooks/useProfile";
import { useView } from "../../context/ViewContext";
import "./AvatarButton.css";

/**
 * The profile entry point in the top bar (all widths): Google photo when the
 * profile has one, initial-letter circle otherwise, generic icon signed out.
 */
export default function AvatarButton() {
	const { user, isAuthenticated } = useSupabaseAuthContext();
	const { profile } = useProfile();
	const { setView } = useView();

	const displayName = profile?.display_name ?? user?.email ?? "";
	const initial = displayName.trim().charAt(0).toUpperCase();

	return (
		<button type="button" className="avatar-btn" aria-label="Profile" onClick={() => setView("profile")}>
			{isAuthenticated && profile?.photo_url ? (
				<img className="avatar-btn__photo" src={profile.photo_url} alt="" role="img" />
			) : isAuthenticated && initial ? (
				<span className="avatar-btn__initial" aria-hidden="true">
					{initial}
				</span>
			) : (
				<UserIcon size={17} aria-hidden="true" />
			)}
		</button>
	);
}
