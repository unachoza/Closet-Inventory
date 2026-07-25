import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Fiber } from "../../Content/Fabric&Fiber";
import { FiberTag } from "./FiberCard";
import "./DetailModal.css";

interface DetailModalProps {
	fiber: Fiber | null;
	onClose: () => void;
	scrollToSection?: string;
	onOpenGuide?: () => void;
}

function DetailModal({ fiber, onClose, scrollToSection, onOpenGuide }: DetailModalProps) {
	const bodyRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	useEffect(() => {
		if (fiber) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [fiber]);

	useEffect(() => {
		if (!fiber || !scrollToSection || !bodyRef.current) return;
		const heading = Array.from(bodyRef.current.querySelectorAll("h4")).find(
			(h) => h.textContent?.toLowerCase() === scrollToSection.toLowerCase(),
		);
		if (heading) {
			requestAnimationFrame(() => heading.scrollIntoView({ behavior: "smooth", block: "start" }));
		}
	}, [fiber, scrollToSection]);

	if (!fiber) return null;

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
				<div className="detail-body" ref={bodyRef}>
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
				{onOpenGuide && (
					<button className="detail-footer-link" onClick={() => { onClose(); onOpenGuide(); }}>
						More on fabrics in the Guide →
					</button>
				)}
			</div>
		</div>,
		document.body,
	);
}

export default DetailModal;
