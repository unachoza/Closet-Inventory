import * as RadixToast from "@radix-ui/react-toast";
import { ReactNode, createContext, useContext, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import "./Toast.css";

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
			{ id: window.crypto.randomUUID(), text },
		]);
	}

	function removeToast(id: string) {
		setMessages((toasts) => toasts.filter((t) => t.id !== id));
	}

	return (
		<RadixToast.Provider duration={4000}>
			<ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>

			{messages.map((toast) => (
				<RadixToast.Root
					key={toast.id}
					open={true}
					onOpenChange={(open) => { if (!open) removeToast(toast.id); }}
					className="toast-root"
				>
					<div className="toast-item">
						<RadixToast.Description className="toast-text">{toast.text}</RadixToast.Description>
						<RadixToast.Close className="toast-close" aria-label="Dismiss">
							<XMarkIcon className="x" />
						</RadixToast.Close>
					</div>
				</RadixToast.Root>
			))}

			<RadixToast.Viewport className="toast-viewport" />
		</RadixToast.Provider>
	);
}
