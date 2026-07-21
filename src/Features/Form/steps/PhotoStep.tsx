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
	return (
		<div className="form-step photo-step">
			<label className="step-label">Snap your item</label>
			<p className="step-hint">Add a photo to recognize it at a glance in your closet.</p>
			<ImageUploaderInput image={imageURL} onImageSelect={onImageSelect} onImageRemove={onImageRemove} />
			{!imageURL && (
				<button
					type="button"
					className={`stock-photo-toggle${useStockPhoto ? " stock-photo-toggle--on" : ""}`}
					aria-pressed={useStockPhoto}
					onClick={() => onUseStockPhoto(!useStockPhoto)}
				>
					{useStockPhoto ? "✓ We'll use a stock photo" : "No photo handy — use a stock photo"}
				</button>
			)}
		</div>
	);
};

export default PhotoStep;
