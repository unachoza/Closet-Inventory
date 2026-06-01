import ContentCard from "../../Components/ContentCard/ContentCard";
import AnimatedContainer from "../../Components/AnimatedContainer/AnimatedContainer";
import { moreFeatures } from "../../utils/constants";
import TextileGuildInteractive from "./TextileGuildInteractive";
import { useState } from "react";

import "./FabricCare.css";

interface FabricCareProps {
	care: string | string[];
}

const FabricCare = ({ care }: FabricCareProps) => {
	const [showGuide, setShowGuide] = useState(false);
	if (!care || (Array.isArray(care) && care.length === 0)) {
		return null; // Don't render anything if care is empty
	}

	return (
		<AnimatedContainer className="content-container" direction="fromBottom" mode="sync">
			<>
				<button onClick={() => setShowGuide(true)}>Open Textile Guide</button>
				{showGuide && <TextileGuildInteractive />}
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
			</>
		</AnimatedContainer>
	);
};

export default FabricCare;
