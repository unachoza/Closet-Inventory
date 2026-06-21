import "./CheckboxCollection.css";
import AnimatedCheckbox from "./RadixCheckbox";
import type { ItemFormData } from "../../../utils/types";

interface CheckboxCollectionProps {
	label: string;
	detailOptions: string[];
	onToggleDetail: (value: string, label: string) => void;
	formData: ItemFormData;
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
							checked={formData[label as keyof ItemFormData] === detail}
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
