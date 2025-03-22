import { useState, useRef, useEffect } from "react";
import "./CheckboxCollection.css";

const CheckboxCollection = ({ label, detailOptions, onToggleDetail, formData }: any) => {
	return (
		<div className="mb-4">
			<label>{label}</label>
			<div className="options-container">
				{detailOptions.map((detail: any) => {
					console.log({ detail });
					// If c is "white", we do black text; otherwise white text
					const labelTextColor = detail === "white" ? "#000" : "#fff";
					return (
						<label
							key={detail}
							className="checkbox-label"
							style={{
								backgroundColor: detail,
								color: labelTextColor,
							}}
						>
							<input
								type="checkbox"
								checked={formData[label] === detail}
								onChange={() => onToggleDetail(detail)}
								className="hidden"
								aria-label={detail}
							/>
							<span>{detail}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
};

export default CheckboxCollection;
