import "./CheckboxCollection.css";
import AnimatedCheckbox from "./RadixCheckbox";

interface CheckboxCollectionProps {
	label: string;
	detailOptions: string[];
	onToggleDetail: (value: string, label: string) => void;
	formData: Record<string, string>;
}

const CheckboxCollection = ({ label, detailOptions, onToggleDetail, formData }: CheckboxCollectionProps) => {
	return (
		<div className="form-step">
			<label>{label}</label>
			<div className="options-container">
				{detailOptions.map((detail: string) => {
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
