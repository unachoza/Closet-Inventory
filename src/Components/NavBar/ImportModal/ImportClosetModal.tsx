import Modal from "../../Modal/Modal";
import type { SkippedImportRow } from "../../../utils/importCloset";
import "../ExportModal/ExportClosetModal.css";
import "./ImportClosetModal.css";

interface ImportClosetModalProps {
	readonly isOpen: boolean;
	readonly currentItemCount: number;
	readonly importItemCount: number;
	readonly skippedItems?: SkippedImportRow[];
	readonly importMode: "replace" | "merge";
	readonly onModeChange: (mode: "replace" | "merge") => void;
	readonly onConfirm: () => void;
	readonly onCancel: () => void;
}

export default function ImportClosetModal({
	isOpen,
	currentItemCount,
	importItemCount,
	skippedItems = [],
	importMode,
	onModeChange,
	onConfirm,
	onCancel,
}: ImportClosetModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			title="Upload Your Closet"
			maxWidth={430}
			footer={
				<>
					<button className="ecm-btn ecm-btn--cancel" onClick={onCancel} type="button">
						Cancel
					</button>
					<button className="ecm-btn ecm-btn--confirm" onClick={onConfirm} type="button">
						Import Closet
					</button>
				</>
			}
		>
			<p className="ecm-description">Choose how you'd like to import this closet file.</p>
			{skippedItems.length > 0 && (
				<div className="ecm-skipped-banner" role="alert">
					<strong>
						Skipped {skippedItems.length} item{skippedItems.length !== 1 ? "s" : ""} missing a name
					</strong>
					<ul className="ecm-skipped-list">
						{skippedItems.map((row) => (
							<li key={`${row.index}-${row.id ?? ""}`}>
								Row {row.index}
								{row.id ? ` (id: ${row.id})` : ""} — {row.reason}
							</li>
						))}
					</ul>
					<p>Fix these in your source file and re-import them separately. Everything else below imported fine.</p>
				</div>
			)}
			<div className="ecm-count-badge-container">

			<div className="ecm-count-badge">
				Found {importItemCount} item{importItemCount !== 1 ? "s" : ""} in this file
			</div>
			<div className="ecm-count-badge">
				Current closet: {currentItemCount} item{currentItemCount !== 1 ? "s" : ""}
			</div>
			</div>
			<div className="ecm-description">
				<label className="import-option">
					<input
						type="radio"
						name="importMode"
						value="replace"
						checked={importMode === "replace"}
						onChange={() => onModeChange("replace")}
					/>
					<span className="import-option__radio" />
					<div className="import-option__label">
						<strong>Replace my current closet</strong>

						<div className="import-option__details">Final closet: {importItemCount} items</div>
					</div>
				</label>
				<label className="import-option">
					<input
						type="radio"
						name="importMode"
						value="merge"
						checked={importMode === "merge"}
						onChange={() => onModeChange("merge")}
					/>
					<span className="import-option__radio" />
					<div className="import-option__label">
						<strong>Add to my current closet</strong>

						<div className="import-option__details">
							Final closet: {currentItemCount + importItemCount} item
							{currentItemCount + importItemCount !== 1 ? "s" : ""}
						</div>
					</div>
				</label>
			</div>
		</Modal>
	);
}
