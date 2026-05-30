import { useEffect, useCallback, type ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
	/** Whether the modal is visible */
	readonly isOpen: boolean;
	/** Called when the modal should close (overlay click, Escape key) */
	readonly onClose: () => void;
	/** Optional title rendered in the modal header */
	readonly title?: string;
	/** Main content of the modal */
	readonly children: ReactNode;
	/** Optional footer content (buttons, actions) */
	readonly footer?: ReactNode;
	/** Max width of the modal panel — defaults to 480px */
	readonly maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 480 }: ModalProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		},
		[onClose],
	);

	useEffect(() => {
		if (!isOpen) return;
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, handleKeyDown]);

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-panel"
				style={{ maxWidth }}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label={title ?? "Dialog"}
			>
				{title && (
					<div className="modal-header">
						<h3 className="modal-title">{title}</h3>
						<button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
							&times;
						</button>
					</div>
				)}

				<div className="modal-body">{children}</div>

				{footer && <div className="modal-footer">{footer}</div>}
			</div>
		</div>
	);
}
