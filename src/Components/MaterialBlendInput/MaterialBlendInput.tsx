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
// Clerk conditional-field reveal (motion.dev/examples/react-clerk-conditional-field):
// the outer wrapper unrolls open by animating height 0 → auto (clipped by
// overflow:hidden) so the fields below are pushed down, while the inner field
// independently fades + slides down (opacity/y). The example's feel is a
// bounce:0.3 spring; visualDuration is bumped to 0.5s to meet our motion floor.
const ROW_REVEAL_TRANSITION = { type: "spring", bounce: 0.3, visualDuration: 0.5 } as const;
const ROW_REVEAL_TRANSITION_REDUCED = { duration: 0.15 } as const;

const MaterialBlendInput = ({ value, onChange }: MaterialBlendInputProps) => {
	const prefersReducedMotion = useReducedMotion();
	const rowTransition = prefersReducedMotion ? ROW_REVEAL_TRANSITION_REDUCED : ROW_REVEAL_TRANSITION;
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

			<div className="mbi__rows">
				<AnimatePresence initial={false}>
					{value.map((blend, index) => {
						const color = blend.material ? getMaterialColor(blend.material) : "#6b7280";
						return (
							// Outer wrapper owns the height reveal (overflow-clipped); the
							// inner wrapper does the field's own fade + slide, exactly as
							// the Clerk example layers the two.
							<motion.div
								key={index}
								className="mbi__row-reveal"
								initial={prefersReducedMotion ? false : { height: 0 }}
								animate={prefersReducedMotion ? {} : { height: "auto" }}
								exit={prefersReducedMotion ? { opacity: 0 } : { height: 0 }}
								transition={rowTransition}
								style={{ overflow: "hidden" }}
							>
								<motion.div
									className="mbi__row-inner"
									initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 0 }}
									transition={rowTransition}
								>
									<div className="mbi__row">
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
								</div>
								</motion.div>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>

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
