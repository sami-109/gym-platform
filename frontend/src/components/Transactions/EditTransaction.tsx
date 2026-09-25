import DatePicker from "react-datepicker";
import "../../styles/_modal.scss";
import "./EditTransactions.scss";
import Loading from "../Loading/Loading";

type EditTransactionProps = {
  action: string;
  amountPaid: string;
  transactionDate: Date | null;
  isSaving: boolean;

  onActionChange: (value: string) => void;
  onAmountPaidChange: (value: string) => void;
  onTransactionDateChange: (date: Date | null) => void;

  onSave: () => void;
  onClose: () => void;
};

function EditTransaction({
  action,
  amountPaid,
  transactionDate,
  isSaving,
  onActionChange,
  onAmountPaidChange,
  onTransactionDateChange,
  onSave,
  onClose,
}: EditTransactionProps) {
  return (
    <div className="modal-backdrop">
      <section className="edit-transaction">
        {isSaving ? (
          <Loading message="Saving transaction..." />
        ) : (
          <>
            <button type="button" className="modal-close" onClick={onClose}>
              ×
            </button>

            <div className="modal-header">
              <h2>Edit Transaction</h2>
            </div>

            <div className="transaction-edit-fields">
              <label>
                Action
                <select
                  value={action}
                  onChange={(event) => onActionChange(event.target.value)}
                >
                  <option value="1-month">1 Month</option>
                  <option value="trial">Trial</option>
                  <option value="day-pass">Day Pass</option>
                </select>
              </label>

              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(event) => onAmountPaidChange(event.target.value)}
                />
              </label>

              <label>
                Transaction Date
                <DatePicker
                  selected={transactionDate}
                  onChange={(date: Date | null) =>
                    onTransactionDateChange(date)
                  }
                  dateFormat="dd/MM/yyyy"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose}>
                Cancel
              </button>

              <button type="button" onClick={onSave}>
                Save
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default EditTransaction;
