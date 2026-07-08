import { useState, useEffect } from "react";
import type { BorderMode } from "../../../utils/borderMode";
import "./BorderLegend.css";

/**
 * P1-10 — accessibility legend for location/status border encoding.
 *
 * Shows the mapping of colors + border-styles to location kinds and statuses.
 * Dismissible (stored in localStorage) and mode-aware: Location mode shows
 * location kinds; Location+Status mode adds status dots.
 *
 * Non-color cues are the accessibility win: dashed/dotted/solid survives
 * grayscale and color-blindness, keeping the system legible.
 */

interface BorderLegendProps {
	readonly borderMode: BorderMode;
	readonly onDismiss?: () => void;
}

const STORAGE_KEY = "closet:border-legend-dismissed";

export function BorderLegend({ borderMode, onDismiss }: BorderLegendProps) {
	const [isDismissed, setIsDismissed] = useState(false);

	// Load dismissal state from localStorage on mount.
	useEffect(() => {
		const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
		setIsDismissed(dismissed);
	}, []);

	const handleDismiss = () => {
		localStorage.setItem(STORAGE_KEY, "true");
		setIsDismissed(true);
		onDismiss?.();
	};

	// Don't render if dismissed or if borders are off.
	if (isDismissed || borderMode === "off") return null;

	return (
		<div className="border-legend">
			<div className="border-legend__content">
				{borderMode === "location" && (
					<>
						<p className="border-legend__title">Location</p>
						<ul className="border-legend__list">
							<li className="border-legend__item">
								<span className="border-legend__swatch border-legend__swatch--home" title="Home: solid border" />
								Home (no color change)
							</li>
							<li className="border-legend__item">
								<span className="border-legend__swatch border-legend__swatch--storage" title="Storage: solid border" />
								Storage
							</li>
							<li className="border-legend__item">
								<span className="border-legend__swatch border-legend__swatch--suitcase" title="Suitcase: dashed border" />
								Suitcase
							</li>
							<li className="border-legend__item">
								<span className="border-legend__swatch border-legend__swatch--other" title="Other: dotted border" />
								Other
							</li>
						</ul>
					</>
				)}

				{borderMode === "location_status" && (
					<>
						<p className="border-legend__title">Location & Status</p>
						<div className="border-legend__section">
							<p className="border-legend__subtitle">Location (borders)</p>
							<ul className="border-legend__list">
								<li className="border-legend__item">
									<span className="border-legend__swatch border-legend__swatch--home" />
									Home
								</li>
								<li className="border-legend__item">
									<span className="border-legend__swatch border-legend__swatch--storage" />
									Storage
								</li>
								<li className="border-legend__item">
									<span className="border-legend__swatch border-legend__swatch--suitcase" />
									Suitcase
								</li>
								<li className="border-legend__item">
									<span className="border-legend__swatch border-legend__swatch--other" />
									Other
								</li>
							</ul>
						</div>

						<div className="border-legend__section">
							<p className="border-legend__subtitle">Status (dots)</p>
							<ul className="border-legend__list">
								<li className="border-legend__item">
									<span className="border-legend__dot border-legend__dot--clean" aria-label="Clean" />
									Clean
								</li>
								<li className="border-legend__item">
									<span className="border-legend__dot border-legend__dot--dirty" aria-label="Dirty" />
									Dirty
								</li>
								<li className="border-legend__item">
									<span className="border-legend__dot border-legend__dot--at-cleaner" aria-label="At cleaner" />
									At cleaner
								</li>
								<li className="border-legend__item">
									<span className="border-legend__dot border-legend__dot--in-repair" aria-label="In repair" />
									In repair
								</li>
								<li className="border-legend__item">
									<span className="border-legend__dot border-legend__dot--traveling" aria-label="Traveling" />
									Traveling
								</li>
								<li className="border-legend__item">
									<span className="border-legend__dot border-legend__dot--on-loan" aria-label="On loan" />
									On loan
								</li>
							</ul>
						</div>
					</>
				)}
			</div>

			<button type="button" className="border-legend__dismiss" onClick={handleDismiss} aria-label="Dismiss legend">
				✕
			</button>
		</div>
	);
}
