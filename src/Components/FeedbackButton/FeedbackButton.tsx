import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import FeedbackPanel from "./FeedbackPanel";
import "./FeedbackButton.css";

/**
 * Floating "Feedback" affordance for the founding-members beta. Opens the
 * shared FeedbackPanel (also reachable from the profile page). Only shown to
 * signed-in users — the feedback table's RLS requires an authenticated author.
 */
export default function FeedbackButton() {
	const { user } = useSupabaseAuthContext();
	const [open, setOpen] = useState(false);

	if (!user) return null;

	return (
		<div className="feedback">
			{open ? (
				<FeedbackPanel onClose={() => setOpen(false)} />
			) : (
				<button type="button" className="feedback__fab" onClick={() => setOpen(true)} aria-label="Send feedback">
					<MessageSquare size={18} aria-hidden="true" />
					<span className="feedback__fab-label">Feedback</span>
				</button>
			)}
		</div>
	);
}
