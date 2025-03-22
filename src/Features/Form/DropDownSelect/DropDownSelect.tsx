import { useState, useRef, useEffect } from "react";
import "./DropDownSelect.css";

export interface Option {
	value: string;
	label: string;
}

interface DropdownProps {
	options: Option[];
}

function DropDownSelect({ options }: any) {
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState(options[0]);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleOptionClick = (option: Option) => {
		setSelected(option);
		setIsOpen(false);
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
