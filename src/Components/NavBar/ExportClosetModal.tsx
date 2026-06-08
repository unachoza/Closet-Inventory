import Modal from "../Modal/Modal";
import "./ExportClosetModal.css";

interface ExportClosetModalProps {
	readonly isOpen: boolean;
	readonly itemCount: number;
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

export default function ExportClosetModal({ isOpen, itemCount, onConfirm, onCancel }: ExportClosetModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			title="Download Your Closet"
			maxWidth={420}
			footer={
				<>
					<button className="ecm-btn ecm-btn--confirm" onClick={onConfirm} type="button">
						Download Spreadsheet
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
