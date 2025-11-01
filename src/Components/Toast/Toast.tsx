import * as RadixToast from "@radix-ui/react-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ComponentRef, ReactNode, createContext, forwardRef, useContext, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import "./toast.css";

const ToastContext = createContext<{ showToast: (text: string) => void }>({
	showToast: () => {
		throw new Error("You can't call showToast() outside of a <ToastProvider> – add it to your tree.");
	},
});

export function useToast() {
	return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);

	function showToast(text: string) {
		setMessages((toasts) => [
			...toasts,
			{
				id: window.crypto.randomUUID(),
				text,
			},
		]);
	}

	return (
		<RadixToast.Provider>
			<ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>

			<AnimatePresence mode="popLayout">
				{messages.map((toast) => (
					<Toast
						key={toast.id}
						text={toast.text}
						onClose={() => setMessages((toasts) => toasts.filter((t) => t.id !== toast.id))}
					/>
				))}
			</AnimatePresence>

			<RadixToast.Viewport className="toast-viewport" />
		</RadixToast.Provider>
	);
}

const Toast = forwardRef<ComponentRef<typeof RadixToast.Root>, { onClose: () => void; text: string }>(function Toast({ onClose, text }, forwardedRef) {
	const width = 320;
	const margin = 16;

	return (
		<RadixToast.Root ref={forwardedRef} asChild forceMount onOpenChange={onClose} duration={5500}>
			<motion.li
				layout
				initial={{ x: width + margin }}
				animate={{ x: 0 }}
				exit={{
					opacity: 0,
					zIndex: -1,
					transition: { opacity: { duration: 0.2 } },
				}}
				transition={{
					type: "spring",
					mass: 1,
					damping: 30,
					stiffness: 200,
				}}
				style={{ width, WebkitTapHighlightColor: "transparent" }}
			> 
				<div className="toast-item">
					<RadixToast.Description className="toast-text">{text}</RadixToast.Description>
					<RadixToast.Close className="toast-close">
						<XMarkIcon className="x" />
					</RadixToast.Close>
				</div>
			</motion.li>
		</RadixToast.Root>
	);
});
