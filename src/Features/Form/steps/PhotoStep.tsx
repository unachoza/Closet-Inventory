import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ImageUploaderInput from "../ImageUploader/ImageUploader";

interface PhotoStepProps {
	imageURL: string | undefined;
	useStockPhoto: boolean;
	onImageSelect: (src: string) => void;
	onImageRemove: () => void;
	onUseStockPhoto: (use: boolean) => void;
}

/**
 * Step 1: the fun part first. A photo (or an explicit "use a stock photo"
 * choice) is required to move on — the stock image itself is resolved from
 * the category at submit time (addItem's getStockPhoto fallback).
 */
const PhotoStep = ({ imageURL, useStockPhoto, onImageSelect, onImageRemove, onUseStockPhoto }: PhotoStepProps) => {
	const prefersReducedMotion = useReducedMotion();

	return (
		<div className="form-step photo-step">
			<label className="step-label">Snap your item</label>
			<p className="step-hint">Add a photo to recognize it at a glance in your closet.</p>
			<ImageUploaderInput image={imageURL} onImageSelect={onImageSelect} onImageRemove={onImageRemove} />
			{!imageURL && (
				<motion.button
					type="button"
					layout
					className={`stock-photo-toggle${useStockPhoto ? " stock-photo-toggle--on" : ""}`}
					aria-pressed={useStockPhoto}
					onClick={() => onUseStockPhoto(!useStockPhoto)}
					transition={{ layout: { duration: prefersReducedMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] } }}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={useStockPhoto ? "on" : "off"}
							initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
							transition={{ duration: prefersReducedMotion ? 0.25 : 0.5, ease: [0.4, 0, 0.2, 1] }}
							style={{ display: "inline-block" }}
						>
							{useStockPhoto ? "✓ We'll use a stock photo" : "No photo handy — use a stock photo"}
						</motion.span>
					</AnimatePresence>
				</motion.button>
			)}
		</div>
	);
};

export default PhotoStep;
