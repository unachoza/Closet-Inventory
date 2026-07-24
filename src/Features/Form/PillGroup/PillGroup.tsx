import CheckPill from "../CheckPill/CheckPill";
import type { ItemFormData } from "../../../utils/types";
import "./PillGroup.css";

interface PillGroupProps {
	label: string;
	fieldName: keyof ItemFormData;
	options: string[];
	formData: ItemFormData;
	onToggle: (value: string, field: keyof ItemFormData) => void;
	/** Optional per-option CSS color/gradient for a swatch dot (e.g. color options). */
	getSwatch?: (value: string) => string;
}

/** Single-select pill grid — replaces the old vertical checkbox column with
 *  wrapping, uniformly-styled tappable pills (same look as the item detail view). */
const PillGroup = ({ label, fieldName, options, formData, onToggle, getSwatch }: PillGroupProps) => {
	return (
		<div className="form-subsection">
			<label className="step-label">{label}</label>
			<div className="pill-group">
				{options.map((option) => (
					<CheckPill
						key={option}
						label={fieldName}
						value={option}
						checked={formData[fieldName] === option}
						onToggle={onToggle}
						swatch={getSwatch?.(option)}
					/>
				))}
			</div>
		</div>
	);
};

export default PillGroup;
