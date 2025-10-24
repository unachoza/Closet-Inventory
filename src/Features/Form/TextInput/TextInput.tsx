import { memo } from "react";
import { InputProps } from "../../../utils/types";
import "./TextInput.css";

const Input = ({ id, label, name, className, value, errorMessage, placeholder, handleFormUpdate, onKeyDown }: InputProps) => {
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
				required
			/>
			<div className="error-message" role="alert" id={`${name}-error`}>
				{errorMessage}
			</div>
		</label>
	);
};

export default memo(Input);

{
	/* <TextInputContainer
						label="material"
						name="material"
						type="text"
						className="string"
						value={formData.material}
						handleChange={(e: { target: { value: any } }) => setFormData((p) => ({ ...p, material: e.target.value }))}
						placeholder="e.g. Cotton, Silk..."
						pillArray={materialExamples}
					/> */
}
