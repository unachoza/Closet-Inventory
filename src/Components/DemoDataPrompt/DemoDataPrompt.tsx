import Modal from "../Modal/Modal";
import type { DemoPrompt } from "../../hooks/demoLifecycle";
import "./DemoDataPrompt.css";

interface DemoDataPromptProps {
	readonly prompt: DemoPrompt;
	/** Keep the sample items for now. */
	readonly onKeep: () => void;
	/** Remove the sample items. */
	readonly onClear: () => void;
}

/**
 * Calm, discrete acknowledgement + clear-the-samples prompt.
 *
 * `celebrate` — shown once, the first time a real item joins the closet: a
 * quiet "nice, your closet is yours now" note that then offers to tidy away the
 * starter samples.
 * `reprompt` — a single later nudge (at the own-item threshold) for users who
 * kept the samples the first time.
 *
 * No confetti, no streaks — a small hanger mark and one sentence, in keeping
 * with the product's calm tone.
 */
export default function DemoDataPrompt({ prompt, onKeep, onClear }: DemoDataPromptProps) {
	if (!prompt) return null;

	const isCelebrate = prompt === "celebrate";

	return (
		<Modal
			isOpen={true}
			onClose={onKeep}
			title={isCelebrate ? "That's your first real piece" : "Ready to clear the samples?"}
			maxWidth={420}
			footer={
				<>
					<button className="btn btn--ghost" type="button" onClick={onKeep}>
						Keep them for now
					</button>
					<button className="btn btn--primary" type="button" onClick={onClear}>
						Clear sample items
					</button>
				</>
			}
		>
			<div className="demo-prompt">
				{isCelebrate && (
					<div className="demo-prompt__mark" aria-hidden="true">
						<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
							<path d="M24 8a4 4 0 1 1 4 4c-2 0-4 1.6-4 4v2" />
							<path d="M24 18 5 30c-1.4.9-.8 3 .9 3h36.2c1.7 0 2.3-2.1.9-3L24 18Z" />
						</svg>
					</div>
				)}
				<p className="demo-prompt__lead">
					{isCelebrate
						? "Nice — this closet is starting to become yours."
						: "Your closet has grown. Those starter samples are still hanging around."}
				</p>
				<p className="demo-prompt__body">
					We pre-loaded a few <strong>sample pieces</strong> so your closet wasn't empty on day one. They stay on this device only — they're
					never saved to your account. Clear them whenever you like; you can always keep them a little longer.
				</p>
			</div>
		</Modal>
	);
}
