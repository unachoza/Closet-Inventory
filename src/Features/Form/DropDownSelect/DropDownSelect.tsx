import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { ItemFormData } from "../../../utils/types";
import "./DropDownSelect.css";

export interface Option {
	value: string;
	label: string;
}

interface DropdownProps {
	options: Option[];
	onOptionSelect: (option: Option) => void;
	setFormData: Dispatch<SetStateAction<ItemFormData>>;
	formField: string;
}

function DropDownSelect({ options, onOptionSelect, setFormData, formField }: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState(options[0]);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};
	const updateForm = (key: string, newValue: string) => {
		setFormData((prev: any) => ({ ...prev, [key]: newValue }));
	};

	const handleOptionClick = (option: Option) => {
		setSelected(option);
		setIsOpen(false);
		// Call the callback if provided to pass the selection back up
		if (onOptionSelect) {
			onOptionSelect(option);
		}
		updateForm(formField, option.value);
	};

	// Close the dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="dropdown" ref={dropdownRef}>
			<div className="dropdown-header" onClick={toggleDropdown}>
				<span className="dropdown-selected">{selected.label}</span>
				<span className={`dropdown-icon ${isOpen ? "open" : ""}`}>&#9662;</span>
			</div>
			<div className={`dropdown-options ${isOpen ? "open" : ""}`}>
				{options.map((option: Option) => (
					<div key={option.value} className="dropdown-option" onClick={() => handleOptionClick(option)}>
						{option.label}
					</div>
				))}
			</div>
		</div>
	);
}

export default DropDownSelect;
