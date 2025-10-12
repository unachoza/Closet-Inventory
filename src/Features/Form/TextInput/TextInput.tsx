import { memo } from "react";
import { InputProps } from "../../../utils/types";
import "./TextInput.css";

const Input = ({ id, label, name, className, value, errorMessage, placeholder, handleChange }: InputProps) => {
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
				onChange={handleChange}
				required
			/>
			<div className="error-message" role="alert" id={`${name}-error`}>
				{errorMessage}
			</div>
		</label>
	);
};

export default memo(Input);
