import "../../styles/_modal.scss";
import "./EditMembershipPrices.scss";

type EditMembershipPricesProps = {
  dayPass: string;
  trial: string;
  oneMonth: string;
  isSaving: boolean;
  onDayPassChange: (value: string) => void;
  onTrialChange: (value: string) => void;
  onOneMonthChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

function EditMembershipPrices({
  dayPass,
  trial,
  isSaving,
  oneMonth,
  onDayPassChange,
  onTrialChange,
  onOneMonthChange,
  onSave,
  onClose,
}: EditMembershipPricesProps) {
  return (
    <div className="modal-backdrop">
      <section className="edit-membership-prices">
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>Edit Membership Prices</h2>
        </div>

        <div className="price-fields">
          <label>
            Day Pass
            <input
              type="number"
              min="0"
              step="0.01"
              value={dayPass}
              onChange={(event) => onDayPassChange(event.target.value)}
            />
          </label>

          <label>
            Trial
            <input
              type="number"
              min="0"
              step="0.01"
              value={trial}
              onChange={(event) => onTrialChange(event.target.value)}
            />
          </label>

          <label>
            1 Month
            <input
              type="number"
              min="0"
              step="0.01"
              value={oneMonth}
              onChange={(event) => onOneMonthChange(event.target.value)}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button type="button" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default EditMembershipPrices;
