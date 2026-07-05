import { CloudOff } from "lucide-react";
import { useSyncStatus } from "../../hooks/useSyncStatus";
import "./SyncStatusIndicator.css";

/**
 * Unobtrusive indicator for background-sync write failures. Renders nothing while
 * everything is synced; when one or more remote writes have failed it shows a
 * small "unsynced" pill so the change isn't lost silently. Recovery still happens
 * automatically on the next successful reconcile (no manual retry needed).
 */
const SyncStatusIndicator = () => {
	const { failedWriteCount, lastError } = useSyncStatus();

	if (failedWriteCount === 0) return null;

	const label = `${failedWriteCount} ${failedWriteCount === 1 ? "change" : "changes"} not synced`;
	const retryNote = "Saved locally — will retry on next reload or sign-in.";
	const title = lastError ? `${label} — ${lastError}. ${retryNote}` : `${label}. ${retryNote}`;

	return (
		<span className="sync-status-indicator" role="status" aria-live="polite" title={title} data-testid="sync-status-indicator">
			<CloudOff size={14} aria-hidden="true" />
			<span className="sync-status-indicator__label">{label}</span>
		</span>
	);
};

export default SyncStatusIndicator;
