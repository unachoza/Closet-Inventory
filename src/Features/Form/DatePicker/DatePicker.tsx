import { ChangeEvent, useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import "./DatePicker.css";

function isValidDate(date: Date) {
	return date instanceof Date && !isNaN(date.getTime());
}

interface DatePickerProps {
	selectedDate?: Date;
	onSelectDate: (date: Date) => void;
}

const DatePicker = ({ selectedDate = new Date(), onSelectDate }: DatePickerProps) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(selectedDate ? (selectedDate instanceof Date ? format(selectedDate, "MMMM dd, yyyy") : selectedDate) : "");

	useEffect(() => {
		if (selectedDate) {
			const parsedDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
			if (!isNaN(parsedDate.getTime())) {
				setValue(format(parsedDate, "MMMM dd, yyyy"));
			}
		}
	}, [selectedDate]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);
		const parsed = new Date(newValue);
		if (isValidDate(parsed)) onSelectDate(parsed);
	};

	const handleDateSelect = (newDate: Date) => {
		if (!(newDate instanceof Date)) return; // safeguard
		onSelectDate(newDate);
		setValue(format(newDate, "MMMM dd, yyyy"));
		setOpen(false);
	};

	return (
		<div className="datepicker-container">
			<div className="datepicker-input-wrapper">
				<input
					id="date"
					value={value}
					onChange={handleInputChange}
					placeholder="select a date"
					onKeyDown={(e) => e.key === "ArrowDown" && setOpen(true)}
					onFocus={() => setOpen(true)}
					className="datepicker-input"
				/>
				<Popover.Root open={open} onOpenChange={setOpen}>
					<Popover.Trigger asChild>
						<button type="button" className="datepicker-button" aria-label="Select date">
							<CalendarIcon size={22} />
						</button>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content className="datepicker-popover" sideOffset={5}>
							<Calendar selected={selectedDate} onSelect={handleDateSelect} />
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			</div>
		</div>
	);
};

/** A simple lightweight calendar (no external UI libs). */

interface CalendarProps {
	selected: Date;
	onSelect: (newDate: Date) => void;
}

function Calendar({ selected, onSelect }: CalendarProps) {
	const [current, setCurrent] = useState(selected || new Date());

	const days = Array.from({ length: 31 }, (_, i) => i + 1); // simple placeholder

	return (
		<div className="calendar">
			<div className="calendar-header">
				<button onClick={() => setCurrent(addMonths(current, -1))}>‹</button>
				<span>{format(current, "MMMM yyyy")}</span>
				<button onClick={() => setCurrent(addMonths(current, 1))}>›</button>
			</div>
			<div className="calendar-grid">
				{days.map((d) => (
					<button
						key={d}
						className={`calendar-day ${selected?.getDate() === d ? "selected" : ""}`}
						onClick={() => onSelect(new Date(current.getFullYear(), current.getMonth(), d))}
					>
						{d}
					</button>
				))}
			</div>
		</div>
	);
}

function addMonths(date: Date, months: number) {
	const newDate = new Date(date);
	newDate.setMonth(date.getMonth() + months);
	return newDate;
}

export default DatePicker;
