import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MaterialBlend } from "../../utils/types";
import { blendTotal, getMaterialColor } from "../../utils/materialUtils";
import { materialExamples } from "../../utils/constants";
import "./MaterialBlendInput.css";

interface MaterialBlendInputProps {
	value: MaterialBlend[];
	onChange: (blend: MaterialBlend[]) => void;
}

const DATALIST_ID = "material-options-list";
const ROW_ENTER_TRANSITION = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };
const ROW_ENTER_TRANSITION_REDUCED = { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const };

const MaterialBlendInput = ({ value, onChange }: MaterialBlendInputProps) => {
	const prefersReducedMotion = useReducedMotion();
	const rowTransition = prefersReducedMotion ? ROW_ENTER_TRANSITION_REDUCED : ROW_ENTER_TRANSITION;
	const total = blendTotal(value);
	const remaining = 100 - total;

	const handleMaterialChange = (index: number, material: string) => {
		const updated = value.map((b, i) => (i === index ? { ...b, material } : b));
		onChange(updated);
	};

	const handlePercentageChange = (index: number, raw: string) => {
		const pct = Math.min(100, Math.max(0, parseInt(raw, 10) || 0));
		const updated = value.map((b, i) => (i === index ? { ...b, percentage: pct } : b));
		onChange(updated);
	};

	const handleAddRow = () => {
		if (remaining > 0) {
			onChange([...value, { material: "", percentage: remaining }]);
			return;
		}
		// At 100%: steal from the largest fiber so the new row gets a non-zero share
		const largestIdx = value.reduce((max, b, i) => (b.percentage > value[max].percentage ? i : max), 0);
		const stolen = Math.max(1, Math.floor(value[largestIdx].percentage / 2));
		const adjusted = value.map((b, i) =>
			i === largestIdx ? { ...b, percentage: b.percentage - stolen } : b,
		);
		onChange([...adjusted, { material: "", percentage: stolen }]);
	};

	const handleRemove = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const isOver = total > 100;
	const isExact = total === 100;

	const totalClass = isOver
		? "mbi__total mbi__total--over"
		: isExact
			? "mbi__total mbi__total--exact"
			: "mbi__total mbi__total--under";

	return (
		<div className="mbi">
			<datalist id={DATALIST_ID}>
				{materialExamples.map((m) => (
					<option key={m} value={m} />
				))}
			</datalist>

			<motion.div layout transition={rowTransition} className="mbi__rows">
				<AnimatePresence initial={false}>
					{value.map((blend, index) => {
						const color = blend.material ? getMaterialColor(blend.material) : "#6b7280";
						return (
							<motion.div
								key={index}
								layout
								className="mbi__row"
								initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
								animate={{ opacity: 1, y: 0 }}
								exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
								transition={rowTransition}
							>
								{/* Color swatch */}
								<span
									className="mbi__swatch"
									style={{ background: color }}
									aria-hidden="true"
								/>

								{/* Material name */}
								<input
									className="mbi__material-input"
									type="text"
									list={DATALIST_ID}
									placeholder="e.g. cotton"
									value={blend.material}
									onChange={(e) => handleMaterialChange(index, e.target.value.toLowerCase())}
									aria-label={`Material ${index + 1} name`}
								/>

								{/* Percentage */}
								<div className="mbi__pct-wrapper">
									<input
										className="mbi__pct-input"
										type="number"
										min={1}
										max={100}
										step={1}
										value={blend.percentage || ""}
										onChange={(e) => handlePercentageChange(index, e.target.value)}
										aria-label={`Material ${index + 1} percentage`}
									/>
									<span className="mbi__pct-symbol">%</span>
								</div>

								{/* Remove */}
								<button
									type="button"
									className="mbi__remove"
									onClick={() => handleRemove(index)}
									aria-label={`Remove ${blend.material || "material"}`}
								>
									<Trash2 size={14} />
								</button>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</motion.div>

			{/* Footer: running total + add button */}
			<div className="mbi__footer">
				<button
					type="button"
					className="mbi__add"
					onClick={handleAddRow}
				>
					<Plus size={14} />
					Add Material
				</button>

				<span className={totalClass} aria-live="polite">
					{total}% / 100%
					{isOver && <span className="mbi__warning"> — over by {total - 100}%</span>}
					{isExact && <span className="mbi__check"> ✓</span>}
				</span>
			</div>
		</div>
	);
};

export default MaterialBlendInput;
