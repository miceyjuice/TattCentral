import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateSelectionProps {
	selectedDate: Date | null;
	onSelect: (date: Date | null) => void;
}

export const DateSelection = ({ selectedDate, onSelect }: DateSelectionProps) => {
	const addMonths = (date: Date, months: number): Date => {
		const newDate = new Date(date);
		newDate.setMonth(newDate.getMonth() + months);
		return newDate;
	};

	return (
		<DatePicker
			selected={selectedDate}
			onSelect={onSelect}
			minDate={new Date()}
			maxDate={addMonths(new Date(), 6)}
			startDate={selectedDate}
			inline
			showDisabledMonthNavigation
			calendarStartDay={1}
			disabledKeyboardNavigation
		/>
	);
};
