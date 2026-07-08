import { useEffect, useState } from "react";
import type { BorderMode } from "../../../utils/borderMode";
import "./BorderLegend.css";

/** * P1-10 — accessibility legend for location/status border encoding. *
 * * Shows the mapping of colors + border-styles to location kinds and statuses.
 * * Dismissible (stored in localStorage) and mode-aware: Location mode shows
 * * location kinds; Location+Status mode adds status dots.
 * * * Non-color cues are the accessibility win: dashed/dotted/solid survives
 * * grayscale and color-blindness, keeping the system legible. */

interface BorderLegendProps {
	readonly borderMode: BorderMode;
	readonly onDismiss?: () => void;
}

const STORAGE_KEY = "closet:border-legend-dismissed";

const LOCATION_ITEMS = [
	{ key: "home", label: "Home", title: "Home: solid border" },
	{ key: "storage", label: "Storage", title: "Storage: solid border" },
	{ key: "suitcase", label: "Suitcase", title: "Suitcase: dashed border" },
	{ key: "other", label: "Other", title: "Other: dotted border" },
] as const;

const STATUS_ITEMS = [
	{ key: "clean", label: "Clean" },
	{ key: "dirty", label: "Dirty" },
	{ key: "at-cleaner", label: "At cleaner" },
	{ key: "in-repair", label: "In repair" },
	{ key: "traveling", label: "Traveling" },
	{ key: "on-loan", label: "On loan" },
] as const;

export function BorderLegend({ borderMode, onDismiss }: BorderLegendProps) {
	const [isDismissed, setIsDismissed] = useState(false);

	useEffect(() => {
		setIsDismissed(localStorage.getItem(STORAGE_KEY) === "true");
	}, []);

	const handleDismiss = () => {
		localStorage.setItem(STORAGE_KEY, "true");
		setIsDismissed(true);
		onDismiss?.();
	};

	if (isDismissed || borderMode === "off") {
		return null;
	}

	const showStatus = borderMode === "location_status";

	return (
		<div className="border-legend">
			<div className="border-legend__content">
				{/* <p className="border-legend__title">{showStatus ? "Location & Status" : "Location"}</p> */}

				<div className="border-legend__section">
					{/* {showStatus && <p className="border-legend__subtitle">Location (borders)</p>} */}

					<ul className="border-legend__list">
						<span className="border-legend__subtitle">Location :</span>
						{LOCATION_ITEMS.map(({ key, label, title }) => (
							<li key={key} className="border-legend__item">
								<span className={`border-legend__swatch border-legend__swatch--${key}`} title={title} />
								{/* TODO: Confirm that we like no explaination for home, and empty boarder makes sense */}
								{/* {showStatus ? label : `${label}${key === "home" ? " (no color change)" : ""}`} */}
								{label}
							</li>
						))}
					</ul>
				</div>

				{showStatus && (
					<div className="border-legend__section">
						{/* <p className="border-legend__subtitle">Status (dots)</p> */}
						<ul className="border-legend__list">
						<span className="border-legend__subtitle">Status:</span>
							{STATUS_ITEMS.map(({ key, label }) => (
								<li key={key} className="border-legend__item">
									<span className={`border-legend__dot border-legend__dot--${key}`} aria-label={label} />
									{label}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<button type="button" className="border-legend__dismiss" onClick={handleDismiss} aria-label="Dismiss legend">
				✕
			</button>
		</div>
	);
}
