import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { ItemFormData } from "../../../utils/types";
import "./DropDownSelect.css";

export interface Option {
	value: string;
	label: string;
}

interface DropdownProps {
	options: Option[];
	formField: string;
	/** Standard form usage: dispatch updates into ItemFormData state. */
	setFormData?: Dispatch<SetStateAction<ItemFormData>>;
	/** Non-form usage (e.g. MonthYearPicker): called with the selected value string. */
	onSelect?: (value: string) => void;
}

function DropDownSelect({ options, setFormData, onSelect, formField }: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState(options[0]);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleOptionClick = (option: Option) => {
		setSelected(option);
		setIsOpen(false);
		if (onSelect) {
			onSelect(option.value);
		} else if (setFormData) {
			setFormData((prev: ItemFormData) => ({ ...prev, [formField]: option.value }));
		}
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
