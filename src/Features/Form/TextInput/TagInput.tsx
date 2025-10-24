import TextInput from "./TextInput";
import CheckPill from "../CheckPill/CheckPill";
import { InputProps, ItemFormData } from "../../../utils/types";
import { ChangeEvent, KeyboardEvent, useState } from "react";

interface TagInputProps extends Omit<InputProps, "value"> {
	pillArray: string[];
	onPillsChange: (values: string[]) => void;
	formData: ItemFormData;
	multiSelect?: boolean;
	label: keyof ItemFormData;
}

const TagInput = ({
	id,
	label,
	name,
	className,
	placeholder,
	handleFormUpdate,
	pillArray,
	onPillsChange,
	formData,
	multiSelect = false,
}: TagInputProps) => {
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
		<div>
			<TextInput
				label={label}
				name={name}
				type="text"
				className={className}
				value={inputValue}
				handleFormUpdate={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
				placeholder={placeholder}
				onKeyDown={handleKeyDown}
			/>
			{pillArray.map((value) => {
				const isActive = formData[label] === value;
				return <CheckPill id={value} label={label as string} value={value} onToggle={handleFormUpdate} checked={isActive} />;
			})}
		</div>
	);
};

export default TagInput;
