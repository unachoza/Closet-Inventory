import { useEffect } from "react";
import "./YourFabrics.css";
import { useClosetFabrics } from "../../hooks/useClosetFabrics";
import { track } from "../../lib/analytics";

interface YourFabricsProps {
	onOpenEncyclopedia: () => void;
}

const YourFabrics = ({ onOpenEncyclopedia }: YourFabricsProps) => {
	const { fabrics } = useClosetFabrics();

	useEffect(() => {
		track("closet_fabrics_viewed", { fabricCount: fabrics.length });
		// Fire once per mount, not on every fabrics recompute.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (fabrics.length === 0) {
		return (
			<div className="your-fabrics your-fabrics--empty">
				<p>Add materials to your items to see your fabric profile here.</p>
				<button type="button" className="your-fabrics__link" onClick={onOpenEncyclopedia}>
					Browse the fabric encyclopedia →
				</button>
			</div>
		);
	}

	return (
		<div className="your-fabrics">
			<div className="your-fabrics__header">
				<h2>Your Fabrics</h2>
				<p>What&apos;s actually in your closet, and how to keep it.</p>
			</div>
			<div className="your-fabrics__grid">
				{fabrics.map((f) => (
					<div className="fabric-card" key={f.name}>
						<div className={`fabric-card__swatch fabric-card__swatch--${f.fiber?.category ?? "default"}`} />
						<div className="fabric-card__info">
							<div className="fabric-card__name">{f.name}</div>
							<div className="fabric-card__count">
								{f.count} {f.count === 1 ? "piece" : "pieces"} · {f.pctOfCloset}% of closet
							</div>
						</div>
						<span className={`fabric-card__pill fabric-card__pill--${f.careTone}`}>{f.careLabel}</span>
						<div className="fabric-card__tip">{f.tip}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default YourFabrics;
