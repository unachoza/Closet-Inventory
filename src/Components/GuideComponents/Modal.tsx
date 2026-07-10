import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Fiber } from "../../Content/Fabric&Fiber";
import { FiberTag } from "./FiberCard";

function DetailModal({ fiber, onClose }: { fiber: Fiber | null; onClose: () => void }) {
      
	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	// Lock body scroll
	useEffect(() => {
		if (fiber) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [fiber]);

	if (!fiber) return null;

	// Rendered via a portal directly under <body>: this modal is otherwise
	// mounted inside .app-content, which has its own `z-index: 1` (needed to
	// sit above the background scrim) and therefore establishes a stacking
	// context. That traps this modal's z-index underneath the sticky NavBar
	// (`z-index: 100`, a sibling of .app-content) no matter how high the
	// modal's own z-index is set. Escaping to document.body sidesteps that
	// entirely so the modal reliably renders above the header.
	return createPortal(
		<div
			className="detail-overlay open"
			onClick={(e) => e.target === e.currentTarget && onClose()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div className="detail-panel">
				<div className="detail-header">
					<div>
						<FiberTag category={fiber.category} label={fiber.tagLabel} />
						<h2
							id="modal-title"
							style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginTop: 8 }}
						>
							{fiber.name}
						</h2>
						<p style={{ fontSize: 14, color: "var(--ink-60)", fontStyle: "italic", marginTop: 4 }}>{fiber.source}</p>
					</div>
					<button className="detail-close" onClick={onClose} aria-label="Close detail panel">
						✕
					</button>
				</div>
				<div className="detail-body">
					{fiber.detail.map((section) => (
						<div key={section.title} className="detail-section">
							<h4>{section.title}</h4>
							{section.content && <p>{section.content}</p>}
							{section.list && (
								<ul>
									{section.list.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			</div>
		</div>,
		document.body,
	);
}

export default DetailModal;
