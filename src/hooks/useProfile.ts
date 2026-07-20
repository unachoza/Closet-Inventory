import { useCallback, useEffect, useState } from "react";
import { useSupabaseAuthContext } from "../context/SupabaseAuthContext";
import { getProfile, updateDisplayName as updateDisplayNameService } from "../services/profileService";
import type { ProfileResult, ProfileRow } from "../services/profileService";

export interface UseProfileState {
	profile: ProfileRow | null;
	isLoading: boolean;
	error: string | null;
	updateDisplayName: (name: string) => Promise<ProfileResult<string>>;
}

/**
 * The signed-in user's profile row (seeded from Google by handle_new_user()).
 * Shared by the onboarding name step and the profile page; fetches whenever the
 * authenticated user changes and applies name edits optimistically on success.
 */
export function useProfile(): UseProfileState {
	const { user } = useSupabaseAuthContext();
	const userId = user?.id ?? null;
	const [profile, setProfile] = useState<ProfileRow | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId) {
			setProfile(null);
			setError(null);
			return;
		}
		let cancelled = false;
		setIsLoading(true);
		setError(null);
		void getProfile(userId).then((result) => {
			if (cancelled) return;
			if (result.ok) setProfile(result.data);
			else setError(result.error);
			setIsLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [userId]);

	const updateDisplayName = useCallback(
		async (name: string): Promise<ProfileResult<string>> => {
			if (!userId) return { ok: false, error: "You need to be signed in to change your name." };
			const result = await updateDisplayNameService(userId, name);
			if (result.ok) {
				setProfile((current) => (current ? { ...current, display_name: result.data } : current));
			}
			return result;
		},
		[userId],
	);

	return { profile, isLoading, error, updateDisplayName };
}
