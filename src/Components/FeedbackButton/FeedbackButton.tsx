import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { useView } from "../../context/ViewContext";
import { submitFeedback } from "../../services/feedbackService";
import { track } from "../../lib/analytics";
import "./FeedbackButton.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/**
 * Floating "Feedback" affordance for the founding-members beta. Opens a small
 * panel; on submit it writes to the Supabase `feedback` table with auto-attached
 * context (app version, view, browser, screen) so a report is reproducible
 * without a back-and-forth. Only shown to signed-in users — the table's RLS
 * requires an authenticated author.
 */
export default function FeedbackButton() {
	const { user } = useSupabaseAuthContext();
	const { view } = useView();
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<Status>({ kind: "idle" });

	if (!user) return null;

	const close = () => {
		setOpen(false);
		setStatus({ kind: "idle" });
		setMessage("");
	};

	const handleSubmit = async () => {
		setStatus({ kind: "sending" });
		const result = await submitFeedback(user.id, message, view);
		if (result.ok) {
			track("feedback_submitted", { view });
			setStatus({ kind: "sent" });
			setMessage("");
			// Let the "Thanks!" state show briefly, then close.
			setTimeout(close, 1500);
		} else {
			setStatus({ kind: "error", message: result.error });
		}
	};

	return (
		<div className="feedback">
			{open ? (
				<div className="feedback__panel" role="dialog" aria-label="Send feedback">
					<div className="feedback__header">
						<span className="feedback__title">Send feedback</span>
						<button type="button" className="feedback__close" aria-label="Close feedback" onClick={close}>
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
			) : (
				<button type="button" className="feedback__fab" onClick={() => setOpen(true)} aria-label="Send feedback">
					<MessageSquare size={18} aria-hidden="true" />
					<span className="feedback__fab-label">Feedback</span>
				</button>
			)}
		</div>
	);
}
