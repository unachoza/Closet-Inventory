import { motion } from "framer-motion";

interface ClosetHeaderProps {
	statusMessage?: string | null;
}

function ClosetHeader({ statusMessage }: ClosetHeaderProps) {
	return (
		<div>
			<h1>My Closet Inventory</h1>

			{/* If there's a status message, display it with a nice animation */}
			{statusMessage && (
				<motion.div
					className="mb-4 p-2 bg-green-300 text-black rounded-lg"
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					{statusMessage}
				</motion.div>
			)}
		</div>
	);
}

export default ClosetHeader;
