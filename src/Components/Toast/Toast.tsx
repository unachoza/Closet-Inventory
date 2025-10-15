// import { motion } from "framer-motion";

// interface ToastProps {
// 	statusMessage?: string | null;
// }

// function ToastMessage({ statusMessage }: ToastProps) {
// 	return (
// 		<motion.div
// 			className="mb-4 p-2 bg-green-300 text-black rounded-lg"
// 			initial={{ scale: 0.8, opacity: 0 }}
// 			animate={{ scale: 1, opacity: 1 }}
// 			transition={{ duration: 0.2 }}
// 		>
// 			{statusMessage}
// 		</motion.div>
// 	);
// }

// export default ToastMessage;
"use client";

import * as Toast from "@radix-ui/react-toast";
import { motion, AnimatePresence } from "framer-motion";
import "./Toast.css";

interface ToastNotificationProps {
	type: "success" | "error";
	title: string;
	description?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ToastNotification({ type, title, description, open, onOpenChange }: ToastNotificationProps) {
	return (
		<Toast.Provider swipeDirection="up">
			<AnimatePresence>
				{open && (
					<Toast.Root asChild open={open} onOpenChange={onOpenChange}>
						<motion.div
							key={type}
							initial={{ y: -60, opacity: 0, scale: 0.95 }}
							animate={{ y: 0, opacity: 1, scale: 1 }}
							exit={{ y: -40, opacity: 0, scale: 0.9 }}
							transition={{ type: "spring", stiffness: 300, damping: 24 }}
							className={`toast-container ${type}`}
						>
							<div className="toast-header">
								<h3 className="toast-title">{title}</h3>
								<button aria-label="Close" onClick={() => onOpenChange(false)} className="toast-close">
									X
								</button>
							</div>
							{description && <p className="toast-description">{description}</p>}
						</motion.div>
					</Toast.Root>
				)}
			</AnimatePresence>
			<Toast.Viewport />
		</Toast.Provider>
	);
}
