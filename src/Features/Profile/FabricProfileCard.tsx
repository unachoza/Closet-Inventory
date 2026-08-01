import { useView } from "../../context/ViewContext";
import { useClosetFabrics } from "../../hooks/useClosetFabrics";
import "./FabricProfileCard.css";

const SEGMENT_COLORS = ["#b89b78", "#c9d3bf", "#d9b8c4", "#a9bcc8", "#cbb9a5", "#9fb0a0"];

/**
 * Secondary discovery path to "Your Fabrics" (Care tab). Mirrors the mockup's
 * Profile echo — a stacked bar + legend, not a duplicate destination. Hidden
 * entirely below the empty-state threshold so a thin closet doesn't show a
 * near-empty bar here either (same rule as the Care tab default).
 */
const MIN_RESOLVABLE_FABRICS = 3;

export default function FabricProfileCard() {
	const { fabrics } = useClosetFabrics();
	const { setView } = useView();

	if (fabrics.length < MIN_RESOLVABLE_FABRICS) return null;

	const total = fabrics.reduce((sum, f) => sum + f.count, 0);

	return (
		<div className="fabric-profile-card">
			<h2 className="fabric-profile-card__title">Fabric profile</h2>
			<div className="fabric-profile-card__bars">
				{fabrics.map((f, i) => (
					<span
						key={f.name}
						style={{ width: `${total > 0 ? (f.count / total) * 100 : 0}%`, background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
					/>
				))}
			</div>
			<div className="fabric-profile-card__legend">
				{fabrics.map((f, i) => (
					<span key={f.name}>
						<span className="fabric-profile-card__dot" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
						{f.name} {f.count}
					</span>
				))}
			</div>
			<button type="button" className="fabric-profile-card__link" onClick={() => setView("fabric")}>
				Open Your Fabrics →
			</button>
		</div>
	);
}
