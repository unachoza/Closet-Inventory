import "./CheckboxCollection.css";
import AnimatedCheckbox from "./RadixCheckbox";

const CheckboxCollection = ({ label, detailOptions, onToggleDetail, formData }: any) => {
	return (
		<div className="form-step">
			<label>{label}</label>
			<div className="options-container">
				{detailOptions.map((detail: any) => {
					return (
						<AnimatedCheckbox
							key={detail}
							label={detail}
							checked={formData[label] === detail}
							onCheckedChange={() => onToggleDetail(detail, label)}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default CheckboxCollection;

// https://examples.motion.dev/react/radix-checkbox
// https://examples.motion.dev/react/use-transform
