import { useRef, useState, ChangeEvent } from "react";
import "./ImageUploader.css";

interface ImageUploaderProps {
	image: string | undefined;
	onImageSelect: (base64: string) => void;
	onImageRemove: () => void;
}

const ImageUploaderInput = ({ image, onImageSelect, onImageRemove }: ImageUploaderProps) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [preview, setPreview] = useState(image || "");

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const base64 = reader.result as string;
			setPreview(base64);
			onImageSelect(base64);
		};
		reader.readAsDataURL(file);
	};

	const handleImageRemove = () => {
		setPreview("");
		onImageRemove();
	};

	return (
		<div className="image-uploader">
			<label>Upload Item Photo</label>
			<div className="image-uploader-box" onClick={() => fileInputRef.current?.click()}>
				{preview ? (
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
