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
}

/** Controlled pill — parent owns the checked state via the `checked` prop.
 *  No internal state = no sync useEffect = no double-render on toggle. */
const CheckPill = memo(function CheckPill({ id, label, value, checked = false, onToggle }: CheckPillProps) {
	return (
		<Checkbox.Root
			id={id}
			className={`pill-box ${checked ? "active" : ""}`}
			checked={checked}
			onCheckedChange={() => onToggle(value, label)}
		>
			<span className="checkbox-label">{value}</span>
		</Checkbox.Root>
	);
});

export default CheckPill;
