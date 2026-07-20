import { useState } from "react";
import { X } from "lucide-react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { useView } from "../../context/ViewContext";
import { submitFeedback } from "../../services/feedbackService";
import { track } from "../../lib/analytics";
import "./FeedbackButton.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export interface FeedbackPanelProps {
	onClose: () => void;
}

/**
 * The feedback dialog itself, shared by the floating FeedbackButton and the
 * profile page's "Send feedback" row. Writes to the Supabase `feedback` table
 * with auto-attached context; requires a signed-in user (table RLS).
 */
export default function FeedbackPanel({ onClose }: FeedbackPanelProps) {
	const { user } = useSupabaseAuthContext();
	const { view } = useView();
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<Status>({ kind: "idle" });

	if (!user) return null;

	const handleSubmit = async () => {
		setStatus({ kind: "sending" });
		const result = await submitFeedback(user.id, message, view);
		if (result.ok) {
			track("feedback_submitted", { view });
			setStatus({ kind: "sent" });
			setMessage("");
			// Let the "Thanks!" state show briefly, then close.
			setTimeout(onClose, 1500);
		} else {
			setStatus({ kind: "error", message: result.error });
		}
	};

	return (
		<div className="feedback__panel" role="dialog" aria-label="Send feedback">
			<div className="feedback__header">
				<span className="feedback__title">Send feedback</span>
				<button type="button" className="feedback__close" aria-label="Close feedback" onClick={onClose}>
					<X size={18} aria-hidden="true" />
				</button>
			</div>

			{status.kind === "sent" ? (
				<p className="feedback__thanks">Thanks — we got it. 💛</p>
			) : (
				<>
					<label htmlFor="feedback-message" className="feedback__label">
						What's working, what's broken, what you wish it did?
					</label>
					<textarea
						id="feedback-message"
						className="feedback__textarea"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						rows={4}
						placeholder="Tell us anything…"
						disabled={status.kind === "sending"}
					/>
					{status.kind === "error" && <p className="feedback__error">{status.message}</p>}
					<button
						type="button"
						className="btn btn--primary btn--sm feedback__submit"
						onClick={handleSubmit}
						disabled={status.kind === "sending" || message.trim().length === 0}
					>
						{status.kind === "sending" ? "Sending…" : "Send"}
					</button>
				</>
			)}
		</div>
	);
}
