import { motion } from "framer-motion";

interface ToastProps {
	statusMessage?: string | null;
}

function ToastMessage({ statusMessage }: ToastProps) {
	return (
		<motion.div
			className="mb-4 p-2 bg-green-300 text-black rounded-lg"
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			{statusMessage}
		</motion.div>
	);
}

export default ToastMessage;
