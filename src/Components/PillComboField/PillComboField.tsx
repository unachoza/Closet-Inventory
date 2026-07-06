import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import "./PillComboField.css";

interface PillComboFieldProps {
	label: string;
	options: string[];
	selected: string[];
	onAdd: (value: string) => void;
	onRemove: (value: string) => void;
	/** When false (default), selecting a new option replaces the current one. */
	multiSelect?: boolean;
}

const PillComboField = ({ label, options, selected, onAdd, onRemove, multiSelect = true }: PillComboFieldProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const availableOptions = options.filter((opt) => !selected.includes(opt));

	const handleSelect = (value: string) => {
		if (!multiSelect) {
			selected.forEach((s) => onRemove(s));
			setIsOpen(false);
		}
		onAdd(value);
	};

	const toggleOpen = () => setIsOpen((prev) => !prev);

	return (
		<div className="pcf" ref={containerRef}>
			<label className="pcf__label">{label}</label>
			<div
				className="pcf__box"
				role="button"
				tabIndex={0}
				onClick={toggleOpen}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						toggleOpen();
					}
				}}
				aria-expanded={isOpen}
				aria-label={`${label} selector`}
			>
				{selected.map((value) => (
					<span key={value} className="pcf__chip">
						{value}
						<button
							type="button"
							className="pcf__chip-remove"
							onClick={(e) => {
								e.stopPropagation();
								onRemove(value);
							}}
							aria-label={`Remove ${value}`}
						>
							<X size={12} />
						</button>
					</span>
				))}
				<span className="pcf__add">+</span>
			</div>

			{isOpen && availableOptions.length > 0 && (
				<div className="pcf__panel">
					{availableOptions.map((opt) => (
						<button
							type="button"
							key={opt}
							className="pcf__option"
							onClick={() => handleSelect(opt)}
						>
							{opt}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default PillComboField;
