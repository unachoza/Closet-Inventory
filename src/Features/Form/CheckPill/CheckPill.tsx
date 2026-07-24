"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import "./CheckPill.css";
import { memo } from "react";
import { ItemFormData } from "../../../utils/types";

interface CheckPillProps {
	id?: string;
	label: keyof ItemFormData;
	value: string;
	onToggle: (value: string, field: keyof ItemFormData) => void;
	checked?: boolean;
	/** CSS color/gradient for a swatch dot shown before the label (e.g. color options). */
	swatch?: string;
	/** Text shown on the pill when it differs from the underlying value
	 *  (e.g. "like_new" stored, "like new" displayed). Defaults to `value`. */
	displayText?: string;
}

/** Controlled pill — parent owns the checked state via the `checked` prop.
 *  No internal state = no sync useEffect = no double-render on toggle. */
const CheckPill = memo(function CheckPill({ id, label, value, checked = false, onToggle, swatch, displayText }: CheckPillProps) {
	return (
		<Checkbox.Root
			id={id}
			className={`pill-box ${checked ? "active" : ""}`}
			checked={checked}
			onCheckedChange={() => onToggle(value, label)}
		>
			{swatch && <span className="pill-swatch" style={{ background: swatch }} aria-hidden="true" />}
			<span className="checkbox-label">{displayText ?? value}</span>
		</Checkbox.Root>
	);
});

export default CheckPill;
