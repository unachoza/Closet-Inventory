import { useState, FormEvent } from "react";
import { useLocalStorageCloset } from "./useLocalStorageCloset";
import type { ItemFormData } from "../utils/types";

export function useForm() {
	const { addItem } = useLocalStorageCloset();
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent, formData: ItemFormData, resetForm: () => void) => {
		e.preventDefault();
		setLoading(true);
		try {
			await new Promise((res) => setTimeout(res, 500)); // simulate delay
			addItem(formData);
			resetForm();
			setStatus("success");
			console.log("suceess");
			setMessage("Item added to your closet successfully!");
		} catch (err) {
			console.error("Form submission failed:", err);
			setStatus("error");
			setMessage("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return { handleSubmit, loading, status, message, setStatus };
}
