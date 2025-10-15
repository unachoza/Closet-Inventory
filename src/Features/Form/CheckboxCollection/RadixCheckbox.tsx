"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import "./AnimatedCheckbox.css";

interface AnimatedCheckboxProps {
	label: string;
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	id?: string;
}

const AnimatedCheckbox = ({ label, checked = false, onCheckedChange, id }: AnimatedCheckboxProps) => {
	const progress = useMotionValue(checked ? 1 : 0);
	const pathLength = useTransform(progress, [0, 1], [0, 1]);
	const opacity = useTransform(progress, [0, 0.2, 1], [0, 0, 1]);

	useEffect(() => {
		const controls = animate(progress, checked ? 1 : 0, {
			duration: 0.35,
			ease: "easeInOut",
		});
		return controls.stop;
	}, [checked, progress]);

	function isColorName(str: string): boolean {
		const s = new Option().style;
		s.color = str;
		return s.color !== "";
	}

	const color = isColorName(label.toLowerCase()) ? label.toLowerCase() : "inherit";

	return (
		<label className="animated-checkbox">
			<Checkbox.Root
				id={id}
				checked={checked}
				onCheckedChange={onCheckedChange}
				className="checkbox-root"
				style={{
					backgroundColor: checked ? color : "inherit",
					borderColor: checked ? color : "#000",
				}}
			>
				<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="checkbox-inner">
					<Checkbox.Indicator forceMount>
						<svg
							viewBox="0 0 24 24"
							className="checkbox-svg"
							fill="none"
							stroke={color === "white" ? "#000" : "#fff"}
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<motion.path d="M5 13l4 4L19 7" style={{ pathLength, opacity }} />
						</svg>
					</Checkbox.Indicator>
				</motion.div>
			</Checkbox.Root>
			<span className="checkbox-label" style={{ color: checked ? color : "inherit" }}>
				{label}
			</span>
		</label>
	);
};

export default AnimatedCheckbox;
