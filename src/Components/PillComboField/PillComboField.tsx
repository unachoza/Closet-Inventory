import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { usePanelIntoView } from "../../hooks/usePanelIntoView";
import { panelRevealProps } from "../../utils/panelMotion";
import "./PillComboField.css";

interface PillComboFieldProps {
	label: string;
	options: string[];
	selected: string[];
	onAdd: (value: string) => void;
	onRemove: (value: string) => void;
	/** When false (default), selecting a new option replaces the current one. */
	multiSelect?: boolean;
}

const PillComboField = ({ label, options, selected, onAdd, onRemove, multiSelect = true }: PillComboFieldProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const prefersReducedMotion = useReducedMotion() ?? false;
	// Re-checks on selection change too: adding a chip can grow the box and push
	// the panel back past the clipping edge.
	const scrollPanelIntoView = usePanelIntoView(panelRef, isOpen, selected.length);

	useEffect(() => {
		if (!isOpen) return;
		// pointerdown (not mousedown) so this closes reliably on iOS Safari, which
		// doesn't always synthesize mousedown for a tap on a non-form element.
		const handleClickOutside = (e: PointerEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", handleClickOutside);
		return () => document.removeEventListener("pointerdown", handleClickOutside);
	}, [isOpen]);

	const availableOptions = options.filter((opt) => !selected.includes(opt));

	const handleSelect = (value: string) => {
		if (!multiSelect) {
			selected.forEach((s) => onRemove(s));
			setIsOpen(false);
		}
		onAdd(value);
	};

	const toggleOpen = () => setIsOpen((prev) => !prev);

	return (
		<div className="pcf" ref={containerRef}>
			<label className="pcf__label">{label}</label>
			<div
				className="pcf__box"
				role="button"
				tabIndex={0}
				onClick={toggleOpen}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						toggleOpen();
					}
				}}
				aria-expanded={isOpen}
				aria-label={`${label} selector`}
			>
				{selected.map((value) => (
					<span key={value} className="pcf__chip">
						{value}
						<button
							type="button"
							className="pcf__chip-remove"
							onClick={(e) => {
								e.stopPropagation();
								onRemove(value);
							}}
							aria-label={`Remove ${value}`}
						>
							<X size={12} />
						</button>
					</span>
				))}
				<span className="pcf__add">+</span>
			</div>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						className="pcf__panel"
						ref={panelRef}
						{...panelRevealProps(prefersReducedMotion)}
						// Re-check once the reveal settles, in case the slide changed how
						// far the panel overhangs the clipping edge.
						onAnimationComplete={() => isOpen && scrollPanelIntoView()}
					>
						{availableOptions.length > 0 ? (
							<div className="pcf__options">
								{availableOptions.map((opt) => (
									<button
										type="button"
										key={opt}
										className="pcf__option"
										onClick={() => handleSelect(opt)}
									>
										{opt}
									</button>
								))}
							</div>
						) : (
							<p className="pcf__empty">All options selected.</p>
						)}
						{/* Explicit dismiss — the panel sits absolutely positioned over
						    whatever follows this field (e.g. Material Composition in the
						    edit form), so outside-tap isn't the only way out. */}
						<button type="button" className="pcf__done" onClick={() => setIsOpen(false)}>
							Done
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default PillComboField;
