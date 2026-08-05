import { memo } from "react";
import { InputProps } from "../../../utils/types";
import "./TextInput.css";

const Input = ({ id, label, name, className, value, errorMessage, placeholder, handleFormUpdate, onKeyDown, required = true }: InputProps) => {
	// `id` is optional on callers; `name` is required and unique per form, so
	// it's the fallback that keeps the error id stable and collision-free
	// without forcing every call site to pass one just for this.
	const errorId = `${id ?? name}-error`;
	return (
		<label>
			{label && <span className="label-text">{label}</span>}
			<input
				id={id}
				name={name}
				className={className ? className : ""}
				value={value}
				type="text"
				placeholder={placeholder}
				onChange={(e) => handleFormUpdate(e, label)}
				onKeyDown={onKeyDown}
				required={required}
				// Without these, the error text is just an unrelated node next to
				// the input — a screen reader focusing the field never hears it.
				aria-invalid={!!errorMessage}
				aria-describedby={errorMessage ? errorId : undefined}
			/>
			{errorMessage && (
				<div className="error-message" role="alert" id={errorId}>
					{errorMessage}
				</div>
			)}
		</label>
	);
};

export default memo(Input);
