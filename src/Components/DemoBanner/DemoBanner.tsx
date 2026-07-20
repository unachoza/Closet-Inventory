import "./DemoBanner.css";

interface DemoBannerProps {
	/** Number of sample (demo-seed) items currently in the closet. */
	readonly count: number;
	/** Remove all sample items. */
	readonly onClear: () => void;
}

/**
 * One-line notice shown while a fresh closet still holds seeded sample items.
 * It names them as samples up front — answering "whose clothes are these?" the
 * moment a new tester lands — and offers to clear them without waiting for the
 * first-real-item celebration (which can't fire until they've added something).
 */
export default function DemoBanner({ count, onClear }: DemoBannerProps) {
	if (count < 1) return null;

	return (
		<div className="demo-banner" role="note">
			<span className="demo-banner__text">
				These {count} pieces are <strong>samples</strong> to show you around — not your clothes.
			</span>
			<button className="demo-banner__clear" type="button" onClick={onClear}>
				Clear samples
			</button>
		</div>
	);
}
