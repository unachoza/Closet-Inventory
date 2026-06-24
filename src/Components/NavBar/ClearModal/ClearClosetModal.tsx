import Modal from "../../Modal/Modal";
import "../ExportModal/ExportClosetModal.css";

interface ClearClosetModalProps {
	readonly isOpen: boolean;
	readonly itemCount: number;
	readonly onConfirm: () => void;
	readonly onCancel: () => void;
}

export default function ClearClosetModal({ isOpen, itemCount, onConfirm, onCancel }: ClearClosetModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			title="Clear Your Closet"
			maxWidth={430}
			footer={
				<>
					<button className="ecm-btn ecm-btn--cancel" onClick={onCancel} type="button">
						Cancel
					</button>
					<button className="ecm-btn ecm-btn--danger" onClick={onConfirm} type="button">
						Delete all items
					</button>
				</>
			}
		>
			<p className="ecm-description">
				This permanently deletes <strong>every item</strong> in your closet, including the sample items NTW
				started you with. This can't be undone.
			</p>
			<div className="ecm-count-badge-container">
				<div className="ecm-count-badge">
					{itemCount} item{itemCount !== 1 ? "s" : ""} will be deleted
				</div>
			</div>
			<p className="ecm-description">
				Want to keep a copy first? Cancel and use <strong>Download Closet</strong> to export a backup.
			</p>
		</Modal>
	);
}
