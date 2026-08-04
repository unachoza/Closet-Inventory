import { useEffect, useRef, useState } from "react";
import "./MaterialCombobox.css";

interface MaterialComboboxProps {
	/** Current material, lowercase. May be a canonical option, a custom value
	 *  from a prior "Other" entry, or a material an import parsed that isn't on
	 *  the canonical list at all (e.g. "merino wool") — always rendered as-is,
	 *  never silently blanked. */
	value: string;
	onChange: (material: string) => void;
	options: string[];
	ariaLabel: string;
}

/**
 * Searchable material picker: typing filters the canonical list; anything
 * typed that isn't on the list is still a valid "Other" value, offered as an
 * explicit "Use "<text>"" row so picking it is a deliberate action rather
 * than an implicit fallback. Selecting an option, pressing Enter, tapping
 * outside, or pressing Done are the only ways to commit — no commit-on-blur,
 * since blur fires before an option's click registers and would race it.
 */
const MaterialCombobox = ({ value, onChange, options, ariaLabel }: MaterialComboboxProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// The row's value can change from outside (e.g. a sibling row's percentage
	// steal on Add) — keep the search text in sync when this field isn't the
	// one being actively edited.
	useEffect(() => {
		if (!isOpen) setQuery(value);
	}, [value, isOpen]);

	const commit = (raw: string) => {
		const next = raw.trim().toLowerCase();
		if (next !== value) onChange(next);
	};

	useEffect(() => {
		if (!isOpen) return;
		// pointerdown (not mousedown/blur) so a tap on an option inside the panel
		// never races the outside-close — see PillComboField for the same choice.
		const handleOutside = (e: PointerEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				commit(query);
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", handleOutside);
		return () => document.removeEventListener("pointerdown", handleOutside);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, query]);

	const normalizedQuery = query.trim().toLowerCase();
	const filtered = normalizedQuery ? options.filter((o) => o.includes(normalizedQuery)) : options;
	const hasExactMatch = options.includes(normalizedQuery);

	const selectOption = (opt: string) => {
		setQuery(opt);
		onChange(opt);
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			commit(query);
			setIsOpen(false);
			inputRef.current?.blur();
		} else if (e.key === "Escape") {
			setQuery(value);
			setIsOpen(false);
			inputRef.current?.blur();
		}
	};

	return (
		<div className="mc" ref={containerRef}>
			<input
				ref={inputRef}
				className="mc__input"
				type="text"
				role="combobox"
				aria-expanded={isOpen}
				aria-label={ariaLabel}
				placeholder="Select or type a material"
				value={query}
				onFocus={() => setIsOpen(true)}
				onChange={(e) => {
					setQuery(e.target.value);
					setIsOpen(true);
				}}
				onKeyDown={handleKeyDown}
			/>

			{isOpen && (
				<div className="mc__panel">
					{filtered.length > 0 && (
						<div className="mc__options">
							{filtered.map((opt) => (
								<button type="button" key={opt} className="mc__option" onClick={() => selectOption(opt)}>
									{opt}
								</button>
							))}
						</div>
					)}
					{filtered.length === 0 && <p className="mc__empty">No matches — use the custom value below.</p>}
					{normalizedQuery && !hasExactMatch && (
						<button type="button" className="mc__custom" onClick={() => selectOption(normalizedQuery)}>
							Use "{query.trim()}"
						</button>
					)}
					<button type="button" className="mc__done" onClick={() => selectOption(normalizedQuery || value)}>
						Done
					</button>
				</div>
			)}
		</div>
	);
};

export default MaterialCombobox;
