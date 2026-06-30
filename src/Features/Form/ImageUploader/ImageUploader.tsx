import { useRef, useState, useContext, ChangeEvent } from "react";
import { compressImage, compressImageToBlob } from "../../../utils/compressImage";
import { uploadItemPhoto, validateImageFile } from "../../../services/storageService";
import { SupabaseAuthContext } from "../../../context/SupabaseAuthContext";
import { useSignedImageUrl } from "../../../hooks/useSignedImageUrl";
import "./ImageUploader.css";

interface ImageUploaderProps {
	image: string | undefined;
	onImageSelect: (src: string) => void;
	onImageRemove: () => void;
}

const ImageUploaderInput = ({ image, onImageRemove, onImageSelect }: ImageUploaderProps) => {
	const auth = useContext(SupabaseAuthContext);
	const userId = auth?.session?.user.id ?? null;
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	// imageValue is whatever onImageSelect receives — a storage path or a base64
	// data URL. The hook resolves either into a displayable src (signing paths,
	// passing base64 through), so there's a single source of truth for the preview.
	const [imageValue, setImageValue] = useState(image ?? "");
	const preview = useSignedImageUrl(imageValue);
	const [isProcessing, setIsProcessing] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const validationError = validateImageFile(file);
		if (validationError) {
			setUploadError(validationError);
			return;
		}

		setIsProcessing(true);
		setUploadError(null);

		try {
			if (userId) {
				// Signed-in path: downscale/recompress (same pipeline as the offline
				// path) before upload, so a multi-MB phone photo doesn't go to Storage
				// raw — smaller uploads, smaller signed-URL downloads, lower storage cost.
				const { blob, ext } = await compressImageToBlob(file);
				const path = await uploadItemPhoto(blob, userId, ext);
				setImageValue(path);
				onImageSelect(path);
			} else {
				// Offline / signed-out: compress to base64 so the item can still be saved.
				// Downscale + recompress large photos before storing as base64, so a few
				// phone photos don't blow past Safari's ~5MB localStorage cap.
				const base64 = await compressImage(file);
				setImageValue(base64);
				onImageSelect(base64);
			}
		} catch {
			setUploadError("Photo upload failed — please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleImageRemove = () => {
		setImageValue("");
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
			{uploadError && <p className="image-uploader-error">{uploadError}</p>}
			{preview && (
				<button type="button" className="remove" onClick={handleImageRemove}>
					Remove
				</button>
			)}
		</div>
	);
};

export default ImageUploaderInput;
