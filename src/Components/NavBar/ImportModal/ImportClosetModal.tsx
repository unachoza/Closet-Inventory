import Modal from "../../Modal/Modal";
import "../ExportModal/ExportClosetModal.css";

interface ImportClosetModalProps {
	readonly isOpen: boolean;
	readonly currentItemCount: number;
	readonly importItemCount: number;
	readonly importMode: "replace" | "merge";
	readonly onModeChange: (mode: "replace" | "merge") => void;
	readonly onConfirm: () => void;
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

export default function ImportClosetModal({
	isOpen,
	currentItemCount,
	importItemCount,
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
			maxWidth={420}
			footer={
				<>
					<button className="ecm-btn ecm-btn--confirm" onClick={onConfirm} type="button">
						Replace Closet
					</button>
					<button className="ecm-btn ecm-btn--confirm" onClick={onConfirm} type="button">
						Merge Closet
					</button>
					<button className="ecm-btn ecm-btn--cancel" onClick={onCancel} type="button">
						Cancel
					</button>
				</>
			}
		>
			{/* <p className="ecm-description">
				Save your wardrobe as a spreadsheet you can open in Excel, Google Sheets, or Numbers — no tech knowledge needed.
			</p> */}

			<div className="ecm-count-badge">
				Found {importItemCount} item{importItemCount !== 1 ? "s" : ""} in this file
			</div>
			<div>
				Current closet: {currentItemCount} item{currentItemCount !== 1 ? "s" : ""}
			</div>
			<div>
				○ Replace my current closet
				<span>
					Final closet: {importItemCount} item{importItemCount !== 1 ? "s" : ""}
				</span>
			</div>

			<div>
				○ Add to my current closet{" "}
				<span>
					Final closet: {currentItemCount} item{currentItemCount !== 1 ? "s" : ""}
				</span>
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
