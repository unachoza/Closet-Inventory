import "./CheckboxCollection.css";

const CheckboxCollection = ({ label, detailOptions, onToggleDetail, formData }: any) => {
	return (
		<div className="form-step">
			<label>{label}</label>
			<div className="options-container">
				{detailOptions.map((detail: any) => {
					return (
						<label key={detail} className="checkbox-label">
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
