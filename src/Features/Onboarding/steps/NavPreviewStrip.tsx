import { Scissors, Plus, Search, Mail, Icon } from "lucide-react";
import { coatHanger } from "@lucide/lab";

/**
 * A non-interactive miniature of the real BottomNav (Closet · Care · Add ·
 * Search · Email) so the final tour screen teaches the UI users actually get.
 * Purely illustrative — the surrounding copy carries the meaning.
 */
export default function NavPreviewStrip() {
	return (
		<div className="onb-navstrip" aria-hidden="true">
			<span className="onb-navstrip__tab onb-navstrip__tab--active">
				<Icon iconNode={coatHanger} size={18} />
				{/* <LayoutGrid size={18} /> */}
				Closet
			</span>
			<span className="onb-navstrip__tab">
				<Scissors size={18} />
				Care
			</span>
			<span className="onb-navstrip__fab">
				<Plus size={18} />
			</span>
			<span className="onb-navstrip__tab">
				<Search size={18} />
				Search
			</span>
			<span className="onb-navstrip__tab">
				<Mail size={18} />
				Email
			</span>
		</div>
	);
}
