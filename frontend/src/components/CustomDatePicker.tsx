import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "../utils/cn";

export interface CustomDatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  showTimeInput?: boolean;
  timeFormat?: string;
  timeInputLabel?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  wrapperClassName?: string;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  scrollableYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  id?: string;
  name?: string;
  required?: boolean;
  showIcon?: boolean;
  timeIntervals?: number;
  excludeTimes?: Date[];
  includeTimes?: Date[];
  filterTime?: (time: Date) => boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string;
    onClick?: () => void;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    showIcon?: boolean;
    showTimeSelect?: boolean;
  }

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, onChange, placeholder, className, showTimeSelect, ...props }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        onClick={onClick}
        placeholder={placeholder}
        className={cn(
          "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 w-full rounded-md px-3 py-2 pr-10",
          "focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none",
          "transition-all duration-200",
          "hover:border-gray-500",
          className
        )}
        readOnly
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {showTimeSelect ? (
          <Clock className="w-4 h-4 text-gray-400" />
        ) : (
          <CalendarIcon className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </div>
  )
);

CustomInput.displayName = "CustomInput";

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  placeholderText = "Select date",
  dateFormat = "yyyy-MM-dd",
  showTimeSelect = false,
  showTimeInput = false,
  timeFormat = "HH:mm",
  timeInputLabel = "Time:",
  minDate,
  maxDate,
  className,
  wrapperClassName,
  showYearDropdown = false,
  showMonthDropdown = false,
  scrollableYearDropdown = false,
  yearDropdownItemNumber = 15,
  disabled = false,
  readOnly = false,
  timeIntervals = 15,
  excludeTimes,
  includeTimes,
  filterTime,
  onBlur,
  onFocus,
  ...props
}) => {
  const finalDateFormat = showTimeSelect || showTimeInput 
    ? `${dateFormat} ${timeFormat}`
    : dateFormat;

  return (
    <div className={cn("relative", wrapperClassName)}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat={finalDateFormat}
        showTimeSelect={showTimeSelect}
        showTimeInput={showTimeInput}
        timeFormat={timeFormat}
        timeInputLabel={timeInputLabel}
        timeIntervals={timeIntervals}
        minDate={minDate}
        maxDate={maxDate}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        scrollableYearDropdown={scrollableYearDropdown}
        yearDropdownItemNumber={yearDropdownItemNumber}
        disabled={disabled}
        readOnly={readOnly}
        excludeTimes={excludeTimes}
        includeTimes={includeTimes}
        filterTime={filterTime}
        onBlur={onBlur}
        onFocus={onFocus}
        customInput={
          <CustomInput 
            className={className}
            showIcon={true}
            showTimeSelect={showTimeSelect || showTimeInput}
          />
        }
        popperClassName="custom-datepicker-popper"
        calendarClassName="custom-datepicker-calendar"
        placeholderText={placeholderText}
        {...props}
      />
      
    </div>
  );
};