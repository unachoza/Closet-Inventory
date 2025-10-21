"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import "./CheckPill.css";

interface CheckPillProps {
	active: boolean;
	label: string;
	id?: string;
}

const CheckPill = ({ active = false, label, id }: CheckPillProps) => {
	const onCheckedChange = () => {
		console.log("pilled out");
	};

	return (
		<Checkbox.Root id={id} checked={active} onCheckedChange={onCheckedChange} className="pill-box">
			<span className="checkbox-label">{label}</span>
		</Checkbox.Root>
	);
};

export default CheckPill;
