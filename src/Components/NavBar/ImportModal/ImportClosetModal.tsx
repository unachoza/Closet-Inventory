import { useEffect, useRef, useState } from "react";
import Modal from "../../Modal/Modal";
import type { SkippedImportRow } from "../../../utils/importCloset";
// import { ImagePlaceholder } from "../../../Features/GmailImport/ProductCard/ProductCard";
import { ImagePlaceholder } from "../../ImagePlaceholder/ImagePlaceholder";
import "../ExportModal/ExportClosetModal.css";
import "./ImportClosetModal.css";

const NAME_SAVED_DEBOUNCE_MS = 600;

interface ImportClosetModalProps {
	readonly isOpen: boolean;
	readonly currentItemCount: number;
	readonly importItemCount: number;
	readonly skippedItems?: SkippedImportRow[];
	readonly skippedNameFixes?: Record<number, string>;
	readonly onSkippedNameChange?: (index: number, value: string) => void;
	readonly importMode: "replace" | "merge";
	readonly onModeChange: (mode: "replace" | "merge") => void;
	readonly onConfirm: () => void;
	readonly onCancel: () => void;
}

/** Best-effort human label for a skipped row, using whatever fields survived validation. */
function describeSkippedRow(row: SkippedImportRow): string {
	const { record } = row;
	const parts = [record.brand, record.category, record.color].filter((v): v is string => typeof v === "string" && v.trim().length > 0);
	return parts.length > 0 ? parts.join(" · ") : `Row ${row.index}`;
}

export default function ImportClosetModal({
	isOpen,
	currentItemCount,
	importItemCount,
	skippedItems = [],
	skippedNameFixes = {},
	onSkippedNameChange,
	importMode,
	onModeChange,
	onConfirm,
	onCancel,
}: ImportClosetModalProps) {
	const fixedCount = skippedItems.filter((row) => (skippedNameFixes[row.index] ?? "").trim().length > 0).length;
	const totalItemCount = importItemCount + fixedCount;

	const [savedRows, setSavedRows] = useState<Record<number, boolean>>({});
	const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

	// Clear any pending timers on unmount so they don't fire after the modal's gone.
	useEffect(() => {
		const timers = debounceTimers.current;
		return () => {
			Object.values(timers).forEach(clearTimeout);
		};
	}, []);

	const handleNameInput = (index: number, value: string) => {
		onSkippedNameChange?.(index, value);
		setSavedRows((prev) => (prev[index] ? { ...prev, [index]: false } : prev));

		clearTimeout(debounceTimers.current[index]);
		if (!value.trim()) return;

		debounceTimers.current[index] = setTimeout(() => {
			setSavedRows((prev) => ({ ...prev, [index]: true }));
		}, NAME_SAVED_DEBOUNCE_MS);
	};

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
						{skippedItems.length} Item{skippedItems.length !== 1 ? "s" : ""} missing a name
					</strong>
					<p>Add a name to include them, or leave blank to skip.</p>
					<ul className="ecm-skipped-list">
						{skippedItems.map((row) => {
							const imageURL = typeof row.record.imageURL === "string" ? row.record.imageURL : "";
							return (
								<li key={`${row.index}-${row.id ?? ""}`} className="ecm-skipped-row">
									{imageURL ? (
										<img className="ecm-skipped-row__thumb" src={imageURL} alt="" />
									) : (
										<div className="ecm-skipped-row__thumb ecm-skipped-row__thumb--empty">
											<ImagePlaceholder color="var(--text-primary)" size="100%" />
										</div>
									)}
									<div className="ecm-skipped-row__meta">
										<span className="ecm-skipped-row__label">{describeSkippedRow(row)}</span>
										<input
											type="text"
											className="ecm-skipped-row__input"
											placeholder="Item name"
											value={skippedNameFixes[row.index] ?? ""}
											onChange={(e) => handleNameInput(row.index, e.target.value)}
										/>
										{savedRows[row.index] && <span className="ecm-skipped-row__saved">✓ item name updated</span>}
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}
			<div className="ecm-count-badge-container">
				<div className="ecm-count-badge">
					Found {totalItemCount} item{totalItemCount !== 1 ? "s" : ""} in this file
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

						<div className="import-option__details">Final closet: {totalItemCount} items</div>
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
							Final closet: {currentItemCount + totalItemCount} item
							{currentItemCount + totalItemCount !== 1 ? "s" : ""}
						</div>
					</div>
				</label>
			</div>
		</Modal>
	);
}
