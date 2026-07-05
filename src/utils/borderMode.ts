/**
 * E2 · closet-overview card border toggle.
 *
 * Off       → no colored border.
 * Location  → border color encodes the item's location (home = neutral).
 * Location + Status → location border + a small status-colored dot per card.
 */
export type BorderMode = 'off' | 'location' | 'location_status';

/** Cycle order for the sticky-bar toggle: off → location → location_status → off. */
export const BORDER_MODE_CYCLE: BorderMode[] = ['off', 'location', 'location_status'];

export function nextBorderMode(mode: BorderMode): BorderMode {
	const i = BORDER_MODE_CYCLE.indexOf(mode);
	return BORDER_MODE_CYCLE[(i + 1) % BORDER_MODE_CYCLE.length];
}

export const BORDER_MODE_LABELS: Record<BorderMode, string> = {
	off: 'Borders: Off',
	location: 'Location',
	location_status: 'Location + Status',
};
