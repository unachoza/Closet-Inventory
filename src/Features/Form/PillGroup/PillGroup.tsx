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
	/** When true, several options can be picked; stored comma-joined in the field. */
	multiSelect?: boolean;
	/** Formats the stored value for display (e.g. "like_new" → "like new"). */
	getLabel?: (value: string) => string;
	/** Splits `options` into separate wrapped rows (e.g. letter sizes / numeric
	 *  sizes) while keeping one shared label and selection. Overrides `options`
	 *  for rendering; `options` is still used to validate/select values. */
	rows?: string[][];
}

/** Split a comma-joined field value into trimmed, non-empty parts. */
const splitValues = (raw: unknown): string[] =>
	typeof raw === "string"
		? raw
				.split(",")
				.map((part) => part.trim())
				.filter(Boolean)
		: [];

/** Tappable pill grid — replaces the old vertical checkbox column with
 *  wrapping, uniformly-styled pills (same look as the edit-form chips).
 *  Single-select by default; multiSelect stores picks comma-joined. */
const PillGroup = ({ label, fieldName, options, formData, onToggle, getSwatch, multiSelect = false, getLabel, rows }: PillGroupProps) => {
	const selected = multiSelect ? splitValues(formData[fieldName]) : [String(formData[fieldName] ?? "")].filter(Boolean);

	const handleToggle = (option: string, field: keyof ItemFormData) => {
		if (multiSelect) {
			const next = selected.includes(option) ? selected.filter((v) => v !== option) : [...selected, option];
			onToggle(next.join(", "), field);
			return;
		}
		// Single-select: tapping the active pill clears it (nothing here is mandatory).
		onToggle(selected.includes(option) ? "" : option, field);
	};

	const renderPill = (option: string) => (
		<CheckPill
			key={option}
			label={fieldName}
			value={option}
			checked={selected.includes(option)}
			onToggle={handleToggle}
			swatch={getSwatch?.(option)}
			displayText={getLabel?.(option)}
		/>
	);

	return (
		<div className="form-subsection">
			<label className="step-label">{label}</label>
			{rows ? (
				rows.map((row, i) => (
					<div className="pill-group" key={i}>
						{row.map(renderPill)}
					</div>
				))
			) : (
				<div className="pill-group">{options.map(renderPill)}</div>
			)}
		</div>
	);
};

export default PillGroup;
