import { Plus, Trash2 } from "lucide-react";
import type { MaterialBlend } from "../../utils/types";
import { blendTotal, getMaterialColor } from "../../utils/materialUtils";
import { materialExamples } from "../../utils/constants";
import "./MaterialBlendInput.css";

interface MaterialBlendInputProps {
	value: MaterialBlend[];
	onChange: (blend: MaterialBlend[]) => void;
}

const DATALIST_ID = "material-options-list";

const MaterialBlendInput = ({ value, onChange }: MaterialBlendInputProps) => {
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
		if (total >= 100) return;
		onChange([...value, { material: "", percentage: remaining }]);
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
				{value.map((blend, index) => {
					const color = blend.material ? getMaterialColor(blend.material) : "#6b7280";
					return (
						<div key={index} className="mbi__row">
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
					);
				})}
			</div>

			{/* Footer: running total + add button */}
			<div className="mbi__footer">
				<button
					type="button"
					className="mbi__add"
					onClick={handleAddRow}
					disabled={total >= 100}
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
