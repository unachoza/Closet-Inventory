import ContentCard from "../../Components/ContentCard/ContentCard";
import { AnimatePresence, motion } from "framer-motion";
import { moreFeatures } from "../../utils/constants";
// import TextileGuildInteractive from "./TextileGuildInteractive";
import { useState } from "react";

import "./FabricCare.css";

interface FabricCareProps {
	care: string | string[];
}

///NOT BEING USED
const FabricCare = ({ care }: FabricCareProps) => {
	const [showGuide, setShowGuide] = useState(false);
	if (!care || (Array.isArray(care) && care.length === 0)) {
		return null; // Don't render anything if care is empty
	}

	return (
		<AnimatePresence>
			<motion.div
				className="content-container"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.3 }}
			>
				<button onClick={() => setShowGuide(true)}>Open Textile Guide</button>
				{/* {showGuide && <TextileGuildInteractive />} */}
				{!showGuide &&
					moreFeatures.map((feature) => (
						<ContentCard key={feature.title} title={feature.title}>
							{feature.children}
						</ContentCard>
					))}

				{typeof care === "string" ? (
					<p>{care}</p>
				) : (
					<ul>
						{care.map((instruction, index) => (
							<li key={index}>{instruction}</li>
						))}
					</ul>
				)}
			</motion.div>
		</AnimatePresence>
	);
};

export default FabricCare;
