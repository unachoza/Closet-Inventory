import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Fiber } from "../../Content/Fabric&Fiber";
import { FiberTag } from "./FiberCard";
import handwashtransparent from "../../assets/handwash-transparent.svg";
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

	//country of origin
	const sources: string[] = fiber.source.split("·").map((item) => item.trim());
	const name = sources[0];
	const countryOfOrigin: string = sources[1];
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
						<p className="detail-source">{name}</p>
						{countryOfOrigin && (
							<ul>
								{countryOfOrigin.split(",").map((country) => (
									<li>{country}</li>
								))}
							</ul>
						)}
					</div>
					<button className="detail-close" onClick={onClose} aria-label="Close detail panel">
						<X size={16} aria-hidden="true" />
					</button>
				</div>
				<div className="detail-body" ref={bodyRef}>
					{fiber.detail.map((section) => {
						const normalizedTitle = section.title.trim().toLowerCase();
						const isCare = normalizedTitle === "care";
						const isKeyFacts = normalizedTitle === "key facts";
						const hasFeaturedFact = isKeyFacts && section.list?.length === 5;
						const mainFact = hasFeaturedFact ? section.list?.[0] : null;
						const displayedFacts = hasFeaturedFact ? section.list?.slice(1) : section.list;
						const sectionBody = (
							<>
								<h4>{section.title}</h4>

								{section.content && <p>{section.content}</p>}

								{section.list && section.list.length > 0 && (
									<ul>
										{section.list.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
								)}
							</>
						);

						const keyFactsSection = (
							<>
								<h4>{section.title}</h4>

								{section.content && <p>{section.content}</p>}

								{displayedFacts && displayedFacts.length > 0 && (
									<div
										className={
											hasFeaturedFact
												? "key-facts-grid-container key-facts-grid-container--featured"
												: "key-facts-grid-container"
										}
									>
										<ul className="key-facts-list">
											{displayedFacts.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>

										{mainFact && (
											<aside className="key-facts-callout">
												<span className="key-facts-callout__quote" aria-hidden="true">
													“
												</span>

												<p>{mainFact}</p>
											</aside>
										)}
									</div>
								)}
							</>
						);

						if (isCare) {
							return (
								<div key={section.title} className="detail-section">
									<div className="detail-care-card">
										{/* <svg
											className="custom-icon" // Add a class name to target in CSS
											viewBox="0 0 234 188"
											width="234"
											height="188"
										>
											<path
												d="M160.25 33.23C162.84 31.63..." // truncated for length
												fill="currentColor" // Inherits the text color variable
												stroke="currentColor" // Inherits the text color variable
												fillRule="evenodd" // CamelCase required for JSX
												strokeWidth="0.25"
												strokeLinejoin="round" // CamelCase required for JSX
											/>
										</svg> */}
										<img  className={`detail-care-icon ${categoryClass}`}  src={handwashtransparent} alt="" aria-hidden="true" />

										<div className="detail-care-body">{sectionBody}</div>
									</div>
								</div>
							);
						}

						if (isKeyFacts) {
							return (
								<div key={section.title} className="detail-section">
									{keyFactsSection}
								</div>
							);
						}

						return (
							<div key={section.title} className="detail-section">
								{sectionBody}
							</div>
						);
					})}
				</div>
				{onOpenGuide && (
					<button
						className="detail-footer-link"
						onClick={() => {
							onClose();
							onOpenGuide();
						}}
					>
						More on fabrics in the Guide →
					</button>
				)}
			</div>
		</div>,
		document.body,
	);
}

export default DetailModal;
