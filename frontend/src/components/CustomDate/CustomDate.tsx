import DatePicker from "react-datepicker";
import "../../styles/_modal.scss";
import "./CustomDate.scss";

type CustomDateProps = {
  fromDate: Date | null;
  toDate: Date | null;

  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;

  onApply: () => void;
  onClose: () => void;
};

function CustomDate({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApply,
  onClose,
}: CustomDateProps) {
  return (
    <div className="modal-backdrop">
      <section className="custom-date">
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>Custom Date</h2>
        </div>

        <div className="custom-date-fields">
          <label>
            From
            <DatePicker
              selected={fromDate}
              onChange={(date: Date | null) => onFromDateChange(date)}
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={20}
              maxDate={toDate ?? undefined}
            />
          </label>

          <label>
            To
            <DatePicker
              selected={toDate}
              onChange={(date: Date | null) => onToDateChange(date)}
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={20}
              minDate={fromDate ?? undefined}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={!fromDate || !toDate}
          >
            Apply
          </button>
        </div>
      </section>
    </div>
  );
}

export default CustomDate;
