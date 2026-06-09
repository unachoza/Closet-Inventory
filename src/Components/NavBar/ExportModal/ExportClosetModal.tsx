import { useState } from "react";
import Modal from "../../Modal/Modal";
import type { ExportFormat } from "../../../utils/exportCloset";
import "./ExportClosetModal.css";
import "../ImportModal/ImportClosetModal.css";

interface ExportClosetModalProps {
	readonly isOpen: boolean;
	readonly itemCount: number;
	readonly onConfirm: (format: ExportFormat) => void;
	readonly onCancel: () => void;
}

const INCLUDED_FIELDS = [
	"Item name & brand",
	"Category, color & size",
	"Price & purchase date",
	"Material composition",
	"Occasion & care instructions",
	"Condition & sale flag",
	"Notes",
];

export default function ExportClosetModal({ isOpen, itemCount, onConfirm, onCancel }: ExportClosetModalProps) {
	const [format, setFormat] = useState<ExportFormat>("csv");

	const confirmLabel = format === "json" ? "Download JSON" : "Download Spreadsheet";

	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			title="Download Your Closet"
			maxWidth={420}
			footer={
				<>
					<button className="ecm-btn ecm-btn--confirm" onClick={() => onConfirm(format)} type="button">
						{confirmLabel}
					</button>
					<button className="ecm-btn ecm-btn--cancel" onClick={onCancel} type="button">
						Cancel
					</button>
				</>
			}
		>
			<p className="ecm-description">
				Save your wardrobe as a spreadsheet you can open in Excel, Google Sheets, or Numbers — no tech knowledge needed.
			</p>

			<div className="ecm-count-badge">
				{itemCount} item{itemCount !== 1 ? "s" : ""} will be exported
			</div>

			<p className="ecm-section-label">Choose a format</p>
			<div className="ecm-description">
				<label className="import-option">
					<input type="radio" name="exportFormat" value="csv" checked={format === "csv"} onChange={() => setFormat("csv")} />
					<span className="import-option__radio" />
					<div className="import-option__label">
						<strong>Spreadsheet (CSV)</strong>
						<div className="import-option__details">Open in Excel, Google Sheets, or Numbers</div>
					</div>
				</label>
				<label className="import-option">
					<input type="radio" name="exportFormat" value="json" checked={format === "json"} onChange={() => setFormat("json")} />
					<span className="import-option__radio" />
					<div className="import-option__label">
						<strong>Backup (JSON)</strong>
						<div className="import-option__details">Best for re-importing — keeps all data exact</div>
					</div>
				</label>
			</div>

			<p className="ecm-section-label">What's included</p>
			<ul className="ecm-field-list">
				{INCLUDED_FIELDS.map((field) => (
					<li key={field} className="ecm-field-item">
						{field}
					</li>
				))}
			</ul>
		</Modal>
	);
}
