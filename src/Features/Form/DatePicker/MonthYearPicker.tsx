import { useEffect, useState } from "react";
import DropDownSelect, { Option } from "../DropDownSelect/DropDownSelect";
// import "./MonthYear.css";

interface MonthYearPickerProps {
	selectedDate?: Date;
	onSelectDate: (date: Date) => void;
}

const MonthYearPicker = ({ selectedDate, onSelectDate }: MonthYearPickerProps) => {
	const today = new Date();
	const currentYear = today.getFullYear();

	const monthOptions: Option[] = Array.from({ length: 12 }, (_, i) => ({
		value: i.toString(),
		label: new Date(0, i).toLocaleString("default", { month: "long" }),
	}));

	const yearOptions: Option[] = Array.from({ length: 50 }, (_, i) => {
		const year = currentYear - i;
		return { value: year.toString(), label: year.toString() };
	});

	const [selectedMonth, setSelectedMonth] = useState<Option>(monthOptions[selectedDate?.getMonth() || 0]);
	const [selectedYear, setSelectedYear] = useState<Option>(
		yearOptions.find((y) => y.value === (selectedDate?.getFullYear() || currentYear).toString()) || yearOptions[0]
	);

	useEffect(() => {
		if (selectedMonth && selectedYear) {
			const newDate = new Date(parseInt(selectedYear.value), parseInt(selectedMonth.value), 1);
			onSelectDate(newDate);
		}
	}, [selectedMonth, selectedYear]);

	return (
		<div className="month-year-dd">
			<DropDownSelect
				options={monthOptions}
				formField="month"
				setFormData={(monthValue: any) => {
					const monthOption = monthOptions.find((m) => m.value === monthValue);
					if (monthOption) setSelectedMonth(monthOption);
				}}
			/>
			<DropDownSelect
				options={yearOptions}
				formField="year"
				setFormData={(yearValue: any) => {
					const yearOption = yearOptions.find((y) => y.value === yearValue);
					if (yearOption) setSelectedYear(yearOption);
				}}
			/>
		</div>
	);
};

export default MonthYearPicker;
