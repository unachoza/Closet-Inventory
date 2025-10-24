import TextInput from "./TextInput";
import CheckPill from "../CheckPill/CheckPill";
import { InputProps, ItemFormData } from "../../../utils/types";
import { ChangeEvent, KeyboardEvent, useState } from "react";

interface TextPillFieldProps extends Omit<InputProps, "value"> {
	pillArray: string[];
	onPillsChange: (values: string[]) => void;
	formData: ItemFormData;
	multiSelect?: boolean;
	label: keyof ItemFormData;
}

const TextPillField = ({
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
}: TextPillFieldProps) => {
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
				return <CheckPill id={value} label={label} value={value} onToggle={handleFormUpdate} checked={isActive} />;
			})}
		</div>
	);
};

export default TextPillField;

/////TODO/////
/////REMOVE PILLS
/////CREATE COMPOUND COMPONENT

/*
 const handlePillToggle = (pillToRemove: string) => {
    const newPills = pills.filter(pill => pill !== pillToRemove);
    setPills(newPills);
    
    if (onPillsChange) {
      onPillsChange(newPills);
    }
  };
*/


{/* <TextPillField label="Brand" placeholder="Add a brand">
  <TextPillField.Input />
  <TextPillField.Pills options={["Zara", "Gucci"]} />
</TextPillField> */}