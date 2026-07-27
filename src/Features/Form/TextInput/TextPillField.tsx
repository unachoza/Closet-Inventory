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

const TextPillField = ({ label, name, className, placeholder, handleFormUpdate, pillArray, onPillsChange, formData, hint }: TextPillFieldProps) => {
	const [pills, setPills] = useState<string[]>(pillArray);
	const [inputValue, setInputValue] = useState<string>("");

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "Tab") {
			e.preventDefault();

			if (inputValue.trim() && !pills.includes(inputValue.trim())) {
				const newPills = [...pills, inputValue.trim()];
				setPills(newPills);
				onPillsChange?.(newPills);
				setInputValue("");
			}
		}
	};

	return (
		<div className="text-pill-field-container">
			<label className="label-text">{label}</label>
			<div className="pill-container">
				{pillArray.map((value) => {
					const isActive = formData[label] === value;
					return <CheckPill key={value} id={value} label={label} value={value} onToggle={handleFormUpdate} checked={isActive} />;
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
