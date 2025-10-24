"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import "./CheckPill.css";
import { useEffect, useState } from "react";
import { ItemFormData } from "../../../utils/types";

interface CheckPillProps {
	id?: string;
	label: keyof ItemFormData;
	value: string;
	onToggle: (value: string, field: keyof ItemFormData) => void;
	checked?: boolean;
}

const CheckPill = ({ id, label, value, checked = false, onToggle }: CheckPillProps) => {
	const [isChecked, setIsChecked] = useState(checked);

	useEffect(() => {
		setIsChecked(checked);
	}, [checked]);

	const handleToggle = () => {
		setIsChecked((prev) => !prev);
		onToggle(value, label);
	};

	return (
		<Checkbox.Root id={id} className={`pill-box ${isChecked ? "active" : ""}`} checked={isChecked} onCheckedChange={handleToggle}>
			<span className="checkbox-label">{value}</span>
		</Checkbox.Root>
	);
};

export default CheckPill;
