import { useState } from "react";
import JourneyC from "./JourneyC";
import "./FiberJourney.css";

type JourneyVariant = "A" | "B" | "C";

const VARIANTS: { key: JourneyVariant; label: string; description: string }[] = [
	{ key: "C", label: "Dark Flowchart", description: "5-column swimlane grid" },
];

const FiberJourney = () => {
	const [variant, setVariant] = useState<JourneyVariant>("A");

	return (
		<div className="fiber-journey">
			<nav className="fj-variant-nav">
				{VARIANTS.map((v) => (
					<button
						key={v.key}
						className={`fj-variant-btn ${variant === v.key ? "fj-variant-btn--active" : ""}`}
						onClick={() => setVariant(v.key)}
						title={v.description}
					>
						<span className="fj-variant-btn__key">{v.key}</span>
						<span className="fj-variant-btn__label">{v.label}</span>
					</button>
				))}
			</nav>

			<div className="fj-variant-content">{variant === "C" && <JourneyC />}</div>
		</div>
	);
};

export default FiberJourney;
