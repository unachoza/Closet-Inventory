import { useMemo, useState } from "react";
import "./PurchasedField.css";

interface PurchasedFieldProps {
	selectedDate?: Date;
	onSelectDate: (date: Date) => void;
}

/** Detects native <input type="month"> support (desktop Safari falls back to text). */
const supportsMonthInput = (): boolean => {
	if (typeof document === "undefined") return false;
	const input = document.createElement("input");
	input.setAttribute("type", "month");
	return input.type === "month";
};

const toMonthValue = (date?: Date): string => {
	if (!date) return "";
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
};

const currentYear = new Date().getFullYear();
const monthNames = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" }));
const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i);

/** Plain-language "when did you buy it?" field — the factual age shown on
 *  the card is derived from this date, so this is the only date input in the form. */
const PurchasedField = ({ selectedDate, onSelectDate }: PurchasedFieldProps) => {
	const [monthSupported] = useState(supportsMonthInput);
	const monthValue = useMemo(() => toMonthValue(selectedDate), [selectedDate]);

	const handleMonthInputChange = (value: string) => {
		if (!value) return;
		const [year, month] = value.split("-").map(Number);
		onSelectDate(new Date(year, month - 1, 1));
	};

	const handleFallbackChange = (monthIndex: number, year: number) => {
		onSelectDate(new Date(year, monthIndex, 1));
	};

	if (monthSupported) {
		return (
			<div className="purchased-field">
				<label htmlFor="purchased-month" className="step-label">
					When did you buy it?
				</label>
				<input
					id="purchased-month"
					type="month"
					className="purchased-field__input"
					value={monthValue}
					max={toMonthValue(new Date())}
					onChange={(e) => handleMonthInputChange(e.target.value)}
				/>
			</div>
		);
	}

	const selectedMonthIndex = selectedDate?.getMonth() ?? 0;
	const selectedYear = selectedDate?.getFullYear() ?? currentYear;

	return (
		<div className="purchased-field">
			<label className="step-label">When did you buy it?</label>
			<div className="purchased-field__fallback">
				<select
					aria-label="Purchase month"
					className="purchased-field__select"
					value={selectedMonthIndex}
					onChange={(e) => handleFallbackChange(Number(e.target.value), selectedYear)}
				>
					{monthNames.map((name, index) => (
						<option key={name} value={index}>
							{name}
						</option>
					))}
				</select>
				<select
					aria-label="Purchase year"
					className="purchased-field__select"
					value={selectedYear}
					onChange={(e) => handleFallbackChange(selectedMonthIndex, Number(e.target.value))}
				>
					{yearOptions.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default PurchasedField;
