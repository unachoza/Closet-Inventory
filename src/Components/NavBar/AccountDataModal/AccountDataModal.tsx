import { useState } from "react";
import Modal from "../../Modal/Modal";
import { useSupabaseAuthContext } from "../../../context/SupabaseAuthContext";
import { exportAccountData, downloadAccountExport, deleteAccount } from "../../../services/accountDataService";
import "../ExportModal/ExportClosetModal.css";
import warning from "../../../assets/warning-white.svg";
import { FileDown } from "lucide-react";

interface AccountDataModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
}

/**
 * E1-4.8 — self-serve data export + account deletion (GDPR/CCPA).
 *
 * Only meaningful for a signed-in (cloud) account; signed-out users have no
 * cloud data (use "Clear Closet" for the local closet). Deletion wipes the
 * user's data and signs them out.
 */
export default function AccountDataModal({ isOpen, onClose }: AccountDataModalProps) {
	const { isAuthenticated, user, signOut } = useSupabaseAuthContext();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDownload = async () => {
		if (!user) return;
		setBusy(true);
		setError(null);
		try {
			const data = await exportAccountData(user.id);
			downloadAccountExport(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Export failed.");
		} finally {
			setBusy(false);
		}
	};

	const handleDelete = async () => {
		if (!user) return;
		const confirmed = window.confirm("Permanently delete your account and ALL your data (items, photos, wardrobe)? This cannot be undone.");
		if (!confirmed) return;
		setBusy(true);
		setError(null);
		try {
			await deleteAccount(user.id);
			await signOut();
			onClose();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Deletion failed.");
			setBusy(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Your Account & Data" maxWidth={460}>
			{!isAuthenticated || !user ? (
				<p className="ecm-description">
					<strong>Sign in</strong> to download or delete your cloud account data. (Your local closet can be cleared from “Clear
					Closet”.)
				</p>
			) : (
				<>
					<p className="ecm-description">Download a copy of everything in your account, or permanently delete your account.</p>
					<div className="ecm-count-badge-container" style={{ flexDirection: "column", gap: "0.75rem" }}>
						<button className="ecm-btn ecm-btn--cancel" onClick={handleDownload} disabled={busy} type="button">
							<FileDown size={16} className="icon" /> Download my data (JSON)
						</button>
						<button className="ecm-btn ecm-btn--danger" onClick={handleDelete} disabled={busy} type="button">
							<img src={warning} alt="Warning" className="icon" /> Delete my account
						</button>
					</div>
					<p className="ecm-description">
						Deleting removes your items, photos, and wardrobe data, then signs you out. This cannot be undone.
					</p>
					{error && (
						<p className="ecm-description" role="alert" style={{ color: "var(--color-danger, #c62828)" }}>
							{error}
						</p>
					)}
				</>
			)}
		</Modal>
	);
}
