import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePanelIntoView } from "../../hooks/usePanelIntoView";
import { panelRevealProps } from "../../utils/panelMotion";
import "./MaterialCombobox.css";

interface MaterialComboboxProps {
	/** Current material, lowercase. Always a canonical option — see
	 *  utils/materialUtils.ts's `MATERIAL_COLORS` for the full vocabulary. */
	value: string;
	onChange: (material: string) => void;
	options: string[];
	ariaLabel: string;
	/**
	 * Fires when the dropdown opens or closes. The parent needs this to lift the
	 * `overflow: hidden` on its row-reveal wrapper, which would otherwise clip
	 * this panel — see MaterialBlendInput.
	 */
	onOpenChange?: (open: boolean) => void;
}

// Live list while typing: only surfaces options that are a plausible match, so
// unrelated results don't clutter the dropdown mid-keystroke.
const LIST_FUSE_OPTIONS = { threshold: 0.4, ignoreLocation: true };
// Commit resolution: no threshold cutoff, so every non-empty query resolves to
// *some* canonical option — there is no free-text escape hatch (see the
// component doc comment for why).
const COMMIT_FUSE_OPTIONS = { threshold: 1, ignoreLocation: true };

/**
 * Searchable material picker. There is no custom/"Other" value: whatever is
 * typed is force-matched to its closest canonical option on commit (Enter,
 * tapping an option, tapping outside, or Done) — "cottton" becomes "cotton",
 * "viscos" becomes "viscose". This only works because `options` (see
 * `canonicalMaterialList` in materialUtils.ts) was reconciled to cover every
 * material FashionParser's own material map actually produces; expand that
 * list, not this component, if a real material starts getting mismatched.
 * No commit-on-blur, since blur fires before an option's click registers and
 * would race it.
 */
const MaterialCombobox = ({ value, onChange, options, ariaLabel, onOpenChange }: MaterialComboboxProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	/** Set while we hand focus back to the input, so onFocus doesn't re-open. */
	const suppressReopen = useRef(false);
	const prefersReducedMotion = useReducedMotion() ?? false;
	// Re-checks as the query narrows the list, since the panel's height (and so
	// how far it overhangs the clipping edge) changes with every keystroke.
	const scrollPanelIntoView = usePanelIntoView(panelRef, isOpen, query);

	// Rebuilt only when the canonical vocabulary itself changes (never, in
	// practice — it's a static list), not per keystroke.
	const listFuse = useMemo(() => new Fuse(options, LIST_FUSE_OPTIONS), [options]);
	const commitFuse = useMemo(() => new Fuse(options, COMMIT_FUSE_OPTIONS), [options]);

	// The row's value can change from outside (e.g. a sibling row's percentage
	// steal on Add) — keep the search text in sync when this field isn't the
	// one being actively edited.
	useEffect(() => {
		if (!isOpen) setQuery(value);
	}, [value, isOpen]);

	// Deliberately keyed on `isOpen` alone: `onOpenChange` is typically an inline
	// arrow, so including it would re-fire on every parent render.
	useEffect(() => {
		onOpenChange?.(isOpen);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	/** Nearest canonical option for arbitrary typed text. Empty input keeps the
	 *  field's current value rather than force-matching a blank string. */
	const resolveToCanonical = (raw: string): string => {
		const q = raw.trim().toLowerCase();
		if (!q) return value;
		if (options.includes(q)) return q;
		return commitFuse.search(q)[0]?.item ?? q;
	};

	const commit = (raw: string) => {
		const next = resolveToCanonical(raw);
		setQuery(next);
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
	const filtered = normalizedQuery ? listFuse.search(normalizedQuery).map((r) => r.item) : options;

	/**
	 * Close and hand focus back to the input.
	 *
	 * Closing unmounts the panel, taking whatever inside it had focus (the
	 * option button just clicked, or Done) down with it — the browser then falls
	 * back to <body>, dropping a keyboard or screen-reader user at the top of
	 * the document mid-form. Enter/Escape are excluded on purpose: those blur
	 * deliberately, to dismiss the mobile keyboard.
	 *
	 * `suppressReopen` matters in a real browser and not in jsdom: clicking an
	 * option moves focus to that button, so focusing the input back fires
	 * `onFocus` and would immediately re-open the panel the click just closed.
	 */
	const closeAndRefocus = () => {
		setIsOpen(false);
		suppressReopen.current = true;
		inputRef.current?.focus();
		suppressReopen.current = false;
	};

	const selectOption = (opt: string) => {
		setQuery(opt);
		onChange(opt);
		closeAndRefocus();
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
				onFocus={() => {
					if (!suppressReopen.current) setIsOpen(true);
				}}
				onChange={(e) => {
					setQuery(e.target.value);
					setIsOpen(true);
				}}
				onKeyDown={handleKeyDown}
			/>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						className="mc__panel"
						ref={panelRef}
						{...panelRevealProps(prefersReducedMotion)}
						// Re-check once the reveal settles, in case the slide changed how
						// far the panel overhangs the clipping edge.
						onAnimationComplete={() => isOpen && scrollPanelIntoView()}
					>
						{filtered.length > 0 ? (
							<div className="mc__options">
								{filtered.map((opt) => (
									<button type="button" key={opt} className="mc__option" onClick={() => selectOption(opt)}>
										{opt}
									</button>
								))}
							</div>
						) : (
							<p className="mc__empty">No close matches — Done will use the nearest option.</p>
						)}
						<button
							type="button"
							className="mc__done"
							onClick={() => {
								commit(query);
								closeAndRefocus();
							}}
						>
							Done
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default MaterialCombobox;
