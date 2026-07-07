import { Cloud, CloudOff } from "lucide-react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { useCloset } from "../../context/ClosetContext";
import type { SyncStatus } from "../../hooks/useCloudCloset";
import "./CloudSyncControl.css";

const SYNC_LABEL: Record<SyncStatus, string> = {
	synced: "Synced",
	syncing: "Syncing…",
	offline: "Offline",
	error: "Sync error",
};

/**
 * E1-1.4 — the entry point for cloud sync + the "which mode am I in?" indicator.
 *
 * Signed out: the closet lives only in this browser (localStorage). A "Sign in
 * to sync" button starts Supabase Google OAuth; on return, `useCloudCloset`
 * seeds the cloud from the local closet (E1-1.5).
 *
 * Signed in: shows the live sync state and a sign-out control.
 */
const CloudSyncControl = () => {
	const { isAuthenticated, user, signIn, signOut, isLoading } = useSupabaseAuthContext();
	const { syncStatus } = useCloset();

	if (!isAuthenticated) {
		return (
			<div className="cloud-sync-control" data-testid="cloud-sync-control">
				<span className="cloud-sync-control__mode cloud-sync-control__mode--local">
					<CloudOff size={14} aria-hidden="true" /> Local only
				</span>
				<button className="cloud-sync-control__btn" onClick={() => void signIn()} disabled={isLoading}>
					Sign in to sync
				</button>
			</div>
		);
	}

	return (
		<div className="cloud-sync-control" data-testid="cloud-sync-control">
			<span className="cloud-sync-control__mode cloud-sync-control__mode--synced" title={user?.email ?? undefined}>
				<Cloud size={14} aria-hidden="true" /> {SYNC_LABEL[syncStatus]}
			</span>
			<button className="cloud-sync-control__btn" onClick={() => void signOut()} disabled={isLoading}>
				Sign out
			</button>
		</div>
	);
};

export default CloudSyncControl;
