import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
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

	// Ties the panel's accent color to the same category palette as the card
	// grid's FiberTag (terracotta/sage/dusty-blue/mauve), so opening a fiber
	// carries its color-coding through instead of flattening to plain gray.
	const categoryClass =
		fiber.category === "animal"
			? "detail-panel--animal"
			: fiber.category === "plant"
				? "detail-panel--plant"
				: fiber.category === "semi"
					? "detail-panel--semi"
					: "detail-panel--synth";

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
			<div className={`detail-panel ${categoryClass}`}>
				<div className="detail-header">
					<div className="detail-header-text">
						<FiberTag category={fiber.category} label={fiber.tagLabel} />
						<h2 id="modal-title" className="detail-title">
							{fiber.name}
						</h2>
						<p className="detail-source">{fiber.source}</p>
					</div>
					<button className="detail-close" onClick={onClose} aria-label="Close detail panel">
						<X size={16} aria-hidden="true" />
					</button>
				</div>
				<div className="detail-body" ref={bodyRef}>
					{fiber.detail.map((section) => {
						const isCare = section.title.trim().toLowerCase() === "care";
						const sectionBody = (
							<>
								<h4>{section.title}</h4>
								{section.content && <p>{section.content}</p>}
								{section.list && (
									<ul>
										{section.list.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
								)}
							</>
						);
						if (!isCare) {
							return (
								<div key={section.title} className="detail-section">
									{sectionBody}
								</div>
							);
						}
						return (
							<div key={section.title} className="detail-section">
								<div className="detail-care-card">
									<svg className="detail-care-icon" viewBox="0 0 96 96" fill="none" aria-hidden="true">
										<g stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
											<path d="M14 48h68l-6 31H20L14 48Z" />
											<path d="M19 56c5-4 10 4 15 0s10 4 15 0 10 4 15 0 10 4 15 0" />
											<path d="M39 45V27c0-2 1-4 3-4s3 2 3 4v13" />
											<path d="M45 39V22c0-2 1-4 3-4s3 2 3 4v17" />
											<path d="M51 39V24c0-2 1-4 3-4s3 2 3 4v18" />
											<path d="M57 42V30c0-2 1-4 3-4s3 2 3 4v20" />
											<path d="M39 35 33 31c-2-1-4 0-5 2-1 2 0 4 2 6l11 10c4 4 7 5 13 5h6c7 0 12-5 12-12v-7" />
										</g>
									</svg>
									<div className="detail-care-body">{sectionBody}</div>
								</div>
							</div>
						);
					})}
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
