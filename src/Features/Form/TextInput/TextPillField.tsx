import TextInput from "./TextInput";
import CheckPill from "../CheckPill/CheckPill";
import { InputProps, ItemFormData } from "../../../utils/types";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import "./TextInput.css";

interface TextPillFieldProps extends Omit<InputProps, "value"> {
	pillArray: string[];
	onPillsChange: (values: string[]) => void;
	formData: ItemFormData;
	multiSelect?: boolean;
	label: keyof ItemFormData;
	/** Optional helper text shown above the custom-entry input, clarifying that
	 *  the preset pills above are just suggestions and typing a new value is fine. */
	hint?: string;
}

/** Split a comma-joined field value into trimmed, non-empty parts. */
const splitValues = (raw: unknown): string[] =>
	typeof raw === "string"
		? raw
				.split(",")
				.map((part) => part.trim())
				.filter(Boolean)
		: [];

const TextPillField = ({ label, name, className, placeholder, handleFormUpdate, pillArray, onPillsChange, formData, multiSelect = false, hint }: TextPillFieldProps) => {
	const [pills, setPills] = useState<string[]>(pillArray);
	const [inputValue, setInputValue] = useState<string>("");

	const selected = multiSelect ? splitValues(formData[label]) : [String(formData[label] ?? "")].filter(Boolean);

	const handleToggle = (value: string, field: keyof ItemFormData) => {
		if (multiSelect) {
			const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
			handleFormUpdate(next.join(", "), field);
			return;
		}
		handleFormUpdate(selected.includes(value) ? "" : value, field);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		// Tab must keep moving focus to the next field — only Enter is "commit
		// and stay put". Previously both preventDefault()'d, which silently
		// trapped keyboard focus in this input with no way to Tab past it.
		if (e.key !== "Enter" && e.key !== "Tab") return;
		if (e.key === "Enter") e.preventDefault();

		if (inputValue.trim() && !pills.includes(inputValue.trim())) {
			const newPills = [...pills, inputValue.trim()];
			setPills(newPills);
			onPillsChange?.(newPills);
			setInputValue("");
		}
	};

	return (
		<div className="text-pill-field-container">
			<label className="label-text">{label}</label>
			<div className="pill-container">
				{pillArray.map((value) => {
					const isActive = selected.includes(value);
					return <CheckPill key={value} id={value} label={label} value={value} onToggle={handleToggle} checked={isActive} />;
				})}
			</div>
			{hint && <p className="pill-field-hint">{hint}</p>}
			<TextInput
				label="Missing Something?"
				name={name}
				type="text"
				className={className}
				value={inputValue}
				handleFormUpdate={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => { if (typeof e !== "string") setInputValue(e.target.value); }}
				placeholder={placeholder}
				onKeyDown={handleKeyDown}
				required={false}
			/>
		</div>
	);
};

export default TextPillField;
