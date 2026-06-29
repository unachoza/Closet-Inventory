import { useRef, useState, useContext, ChangeEvent } from "react";
import { compressImage } from "../../../utils/compressImage";
import { uploadItemPhoto, signItemPhotoPath } from "../../../services/storageService";
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
	// preview holds a displayable src (base64 or signed URL); imageURL field gets the path/base64.
	const resolvedInitial = useSignedImageUrl(image);
	const [preview, setPreview] = useState(resolvedInitial);
	const [isProcessing, setIsProcessing] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsProcessing(true);
		setUploadError(null);

		try {
			if (userId) {
				// Signed-in path: upload to Storage, store the bare path.
				const path = await uploadItemPhoto(file, userId);
				const signedUrl = await signItemPhotoPath(path);
				setPreview(signedUrl);
				onImageSelect(path);
			} else {
				// Offline / signed-out: compress to base64 so the item can still be saved.
				// Downscale + recompress large photos before storing as base64, so a few
				// phone photos don't blow past Safari's ~5MB localStorage cap.
				const base64 = await compressImage(file);
				setPreview(base64);
				onImageSelect(base64);
			}
		} catch {
			setUploadError("Photo upload failed — please try again.");
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
