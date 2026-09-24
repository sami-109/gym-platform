import "../../styles/_modal.scss";
import "./ConfirmModal.scss";

type ConfirmModalProps = {
  title: string;
  memberName: string;
  memberId: number;
  isLoading: boolean;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmModal({
  title,
  memberName,
  memberId,
  message,
  isLoading,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="modal-backdrop">
      <section className="confirm-modal">
        <button type="button" className="modal-close" onClick={onCancel}>
          ×
        </button>

        <div className="modal-header">
          <h2>{title}</h2>

          <p>
            <strong>Name:</strong> {memberName}
          </p>

          <p>
            <strong>ID:</strong> {memberId}
          </p>

          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button type="button" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Loading..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
