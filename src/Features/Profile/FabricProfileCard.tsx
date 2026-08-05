import { useView } from "../../context/ViewContext";
import { useClosetFabrics } from "../../hooks/useClosetFabrics";
import { groupFabricsByCategory } from "./groupFabricsByCategory";
import "./FabricProfileCard.css";

/**
 * Secondary discovery path to "Your Fabrics" (Care tab). Mirrors the mockup's
 * Profile echo — a donut chart + legend grouped by fiber category, not a
 * duplicate destination. Hidden entirely below the empty-state threshold so
 * a thin closet doesn't show a near-empty ring here either (same rule as the
 * Care tab default).
 */
const MIN_RESOLVABLE_FABRICS = 3;

const DONUT_SIZE = 84 * 1.5; /* 2x for retina */
const DONUT_RADIUS = 34 * 1.5; /* 2x for retina */
const DONUT_STROKE_WIDTH = 14 * 1.7; /* 2x for retina */
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

interface DonutSegment {
	group: string;
	color: string;
	dashArray: string;
	dashOffset: number;
}

function buildDonutSegments(groups: { group: string; count: number; color: string }[], total: number): DonutSegment[] {
	let cumulative = 0;
	return groups.map((g) => {
		const fraction = total > 0 ? g.count / total : 0;
		const dash = fraction * DONUT_CIRCUMFERENCE;
		const segment: DonutSegment = {
			group: g.group,
			color: g.color,
			dashArray: `${dash} ${DONUT_CIRCUMFERENCE - dash}`,
			dashOffset: -cumulative,
		};
		cumulative += dash;
		return segment;
	});
}

export default function FabricProfileCard() {
	const { fabrics } = useClosetFabrics();
	const { setView } = useView();

	if (fabrics.length < MIN_RESOLVABLE_FABRICS) return null;

	const groups = groupFabricsByCategory(fabrics);
	const total = groups.reduce((sum, g) => sum + g.count, 0);
	const segments = buildDonutSegments(groups, total);

	return (
		<div className="fabric-profile-card">
			<h2 className="fabric-profile-card__title">Fabric profile</h2>
			<div className="fabric-profile-card__body">
				<svg
					className="fabric-profile-card__donut"
					viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
					width={DONUT_SIZE}
					height={DONUT_SIZE}
					role="img"
					aria-label={`Fabric breakdown: ${groups
						.map((g) => `${g.label} ${total > 0 ? Math.round((g.count / total) * 100) : 0}% (${g.fabricNames.join(", ")})`)
						.join(", ")}`}
				>
					<circle
						className="fabric-profile-card__donut-track"
						cx={DONUT_SIZE / 2}
						cy={DONUT_SIZE / 2}
						r={DONUT_RADIUS}
						fill="none"
						strokeWidth={DONUT_STROKE_WIDTH}
					/>
					<g transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}>
						{segments.map((segment) => (
							<circle
								key={segment.group}
								cx={DONUT_SIZE / 2}
								cy={DONUT_SIZE / 2}
								r={DONUT_RADIUS}
								fill="none"
								stroke={segment.color}
								strokeWidth={DONUT_STROKE_WIDTH}
								strokeDasharray={segment.dashArray}
								strokeDashoffset={segment.dashOffset}
							/>
						))}
					</g>
				</svg>
				<ul className="fabric-profile-card__legend">
					{groups.map((g) => (
						<li key={g.group}>
							<span className="fabric-profile-card__dot" style={{ background: g.color }} />
							{g.label} {total > 0 ? Math.round((g.count / total) * 100) : 0}%
						</li>
					))}
				</ul>
			</div>
			<button type="button" className="fabric-profile-card__link" onClick={() => setView("fabric")}>
				Open Your Fabrics →
			</button>
		</div>
	);
}
