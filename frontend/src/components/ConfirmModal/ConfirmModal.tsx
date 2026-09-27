import "../../styles/_modal.scss";
import "./ConfirmModal.scss";
import Loading from "../Loading/Loading";
import type { ConfirmModalProps } from "../../types/confirmModal";

function ConfirmModal({
  title,
  memberName,
  memberId,
  message,
  isLoading,
  isLoadingMessage = "Loading...",
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="modal-backdrop confirm-modal-backdrop">
      <section className="confirm-modal">
        {isLoading ? (
          <Loading message={isLoadingMessage} />
        ) : (
          <>
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

              <button type="button" onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default ConfirmModal;
