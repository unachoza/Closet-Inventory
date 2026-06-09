import { useRef, useState, ChangeEvent } from "react";
import { compressImage } from "../../../utils/compressImage";
import "./ImageUploader.css";

interface ImageUploaderProps {
	image: string | undefined;
	onImageSelect: (base64: string) => void;
	onImageRemove: () => void;
}

const ImageUploaderInput = ({ image, onImageSelect, onImageRemove }: ImageUploaderProps) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [preview, setPreview] = useState(image || "");
	const [isProcessing, setIsProcessing] = useState(false);

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Downscale + recompress large photos before storing as base64, so a few
		// phone photos don't blow past Safari's ~5MB localStorage cap.
		setIsProcessing(true);
		try {
			const base64 = await compressImage(file);
			setPreview(base64);
			onImageSelect(base64);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleImageRemove = () => {
		setPreview("");
		onImageRemove();
	};

	return (
		<div className="image-uploader">
			<label>Upload Item Photo</label>
			<div className="image-uploader-box" onClick={() => fileInputRef.current?.click()}>
				{isProcessing ? (
					<div className="image-placeholder">Processing photo…</div>
				) : preview ? (
					<img src={preview} className="image-preview" alt="preview" />
				) : (
					<div className="image-placeholder">Click to upload</div>
				)}
				<input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
			</div>
			{preview && (
				<button type="button" className="remove" onClick={handleImageRemove}>
					Remove
				</button>
			)}
		</div>
	);
};

export default ImageUploaderInput;
