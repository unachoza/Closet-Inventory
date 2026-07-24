import { ChangeEvent } from "react";

interface PurchasedFieldProps {
	/** ISO datetime string (or "") from formData.purchaseDate. */
	value: string;
	onChange: (isoDate: string) => void;
	/** Injectable for tests; defaults to real feature detection. */
	monthInputSupported?: boolean;
}

const MONTH_LABELS = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];

/** Does this browser render <input type="month"> natively? (iOS yes, desktop Safari/Firefox no) */
export function isMonthInputSupported(): boolean {
	const el = document.createElement("input");
	el.setAttribute("type", "month");
	return el.type === "month";
}

const toMonthValue = (iso: string): string => {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** First-of-month ISO, matching what the old MonthYearPicker wrote into purchaseDate. */
const monthToIso = (year: number, monthIndex: number): string => new Date(year, monthIndex, 1).toISOString();

/**
 * "Purchased" month picker. Native <input type="month"> where supported (mobile),
 * otherwise two native <select>s — no custom popover, so nothing can bleed out
 * of the card (the old DropDownSelect overlay bug).
 */
const PurchasedField = ({ value, onChange, monthInputSupported }: PurchasedFieldProps) => {
	const supported = monthInputSupported ?? isMonthInputSupported();

	const handleMonthInput = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.value) {
			onChange("");
			return;
		}
		const [year, month] = e.target.value.split("-").map(Number);
		onChange(monthToIso(year, month - 1));
	};

	if (supported) {
		return (
			<input
				type="month"
				className="purchased-month-input"
				aria-label="Purchased month"
				value={toMonthValue(value)}
				max={toMonthValue(new Date().toISOString())}
				onChange={handleMonthInput}
			/>
		);
	}

	const selected = value ? new Date(value) : null;
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

	const handleSelectChange = (monthIndex: number, year: number) => onChange(monthToIso(year, monthIndex));

	return (
		<div className="purchased-selects">
			<select
				aria-label="Purchased month"
				value={selected ? selected.getMonth() : ""}
				onChange={(e) => handleSelectChange(Number(e.target.value), selected?.getFullYear() ?? currentYear)}
			>
				<option value="" disabled>
					Month
				</option>
				{MONTH_LABELS.map((label, i) => (
					<option key={label} value={i}>
						{label}
					</option>
				))}
			</select>
			<select
				aria-label="Purchased year"
				value={selected ? selected.getFullYear() : ""}
				onChange={(e) => handleSelectChange(selected?.getMonth() ?? 0, Number(e.target.value))}
			>
				<option value="" disabled>
					Year
				</option>
				{years.map((year) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>
		</div>
	);
};

export default PurchasedField;
