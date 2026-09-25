import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Member } from "../../types/member";
import { getMembershipDisplay } from "../../utils/membership";
import PhoneInput from "../PhoneInput/PhoneInput";
import "../../styles/_modal.scss";
import "./ManageMember.scss";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import Loading from "../Loading/Loading";

type ManageMemberProps = {
  member: Member;
  currentTime: number;
  onRetrieveCredentials: (memberId: number) => Promise<void>;

  firstName: string;
  isRetrievingCredentials: boolean;
  lastName: string;
  applyingChanges: boolean;
  phone: string;
  email: string;
  startDate: string;
  expiryDate: string;
  action: string;
  error: string;

  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onActionChange: (value: string) => void;

  onApply: () => void;
  onClose: () => void;
};

function ManageMember({
  member,
  currentTime,
  firstName,
  lastName,
  phone,
  applyingChanges,
  isRetrievingCredentials,
  email,
  onRetrieveCredentials,
  startDate,
  expiryDate,
  action,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onEmailChange,
  onStartDateChange,
  onExpiryDateChange,
  onActionChange,
  onApply,
  onClose,
  error,
}: ManageMemberProps) {
  const [showRetrieveConfirm, setShowRetrieveConfirm] = useState(false);
  return (
    <div className="modal-backdrop">
      <section className="manage-member-modal">
        {applyingChanges ? (
          <Loading message="Applying changes..." />
        ) : (
          <>
            <button type="button" className="modal-close" onClick={onClose}>
              ×
            </button>

            <div className="modal-header">
              <h2>Manage Member</h2>

              <p>
                {member.user.firstName} {member.user.lastName}
              </p>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Personal Information</h3>

                <button
                  type="button"
                  className="retrieve-credentials-button"
                  onClick={() => setShowRetrieveConfirm(true)}
                >
                  Retrieve Credentials
                </button>
              </div>

              <div className="form-grid">
                <label>
                  First Name
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => onFirstNameChange(event.target.value)}
                  />
                </label>

                <label>
                  Last Name
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => onLastNameChange(event.target.value)}
                  />
                </label>
              </div>

              <PhoneInput phone={phone} onPhoneChange={onPhoneChange} />

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                />
              </label>
              {error && <p className="form-error">{error}</p>}
            </div>

            <div className="form-section">
              <h3>Membership</h3>

              {member.user.status === "DEACTIVATED" ? (
                <>
                  <div className="membership-display">
                    <span>Membership Status: </span>
                    <strong>{getMembershipDisplay(member, currentTime)}</strong>
                  </div>

                  <label>
                    Membership Action
                    <select
                      value={action}
                      onChange={(event) => onActionChange(event.target.value)}
                    >
                      <option value="">No action</option>
                      <option value="activate">Activate</option>
                    </select>
                  </label>
                </>
              ) : member.status === "FROZEN" ? (
                <>
                  <div className="membership-display">
                    <span>Membership Status: </span>
                    <strong>Membership Frozen</strong>
                  </div>

                  <label>
                    Membership Action
                    <select
                      value={action}
                      onChange={(event) => onActionChange(event.target.value)}
                    >
                      <option value="">No action</option>
                      <option value="resume">Resume</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <div className="form-grid">
                    <label>
                      Start Date
                      <DatePicker
                        selected={startDate ? new Date(startDate) : null}
                        onChange={(date: Date | null) => {
                          if (date) {
                            onStartDateChange(date.toISOString());
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        disabled={action !== ""}
                      />
                    </label>

                    <label>
                      End Date
                      <DatePicker
                        selected={expiryDate ? new Date(expiryDate) : null}
                        onChange={(date: Date | null) => {
                          if (date) {
                            onExpiryDateChange(date.toISOString());
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        disabled={action !== ""}
                      />
                    </label>
                  </div>

                  {member.status === "ACTIVE" && (
                    <div className="membership-display">
                      <span>Time Remaining: </span>
                      <strong>
                        {getMembershipDisplay(member, currentTime)}
                      </strong>
                    </div>
                  )}

                  <label>
                    Membership Action
                    <select
                      value={action}
                      onChange={(event) => onActionChange(event.target.value)}
                    >
                      <option value="">No action</option>

                      {member.status === "ACTIVE" && (
                        <>
                          <option value="freeze">Freeze</option>
                          <option value="renew">Renew</option>
                          <option value="deactivate">Deactivate</option>
                        </>
                      )}

                      {member.status === "EXPIRED" && (
                        <>
                          <option value="renew">Renew</option>
                          <option value="day-pass">Day Pass</option>
                          <option value="deactivate">Deactivate</option>
                        </>
                      )}
                    </select>
                  </label>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose}>
                Close
              </button>

              <button type="button" onClick={onApply}>
                Apply Changes
              </button>
            </div>

            {showRetrieveConfirm && (
              <ConfirmModal
                title="Retrieve Credentials"
                memberName={`${member.user.firstName} ${member.user.lastName}`}
                memberId={member.user.id}
                message="Are you sure you want to retrieve this member's credentials?"
                isLoading={isRetrievingCredentials}
                isLoadingMessage="Retrieving credentials..."
                confirmLabel="Retrieve"
                onConfirm={async () => {
                  await onRetrieveCredentials(member.user.id);
                  setShowRetrieveConfirm(false);
                }}
                onCancel={() => setShowRetrieveConfirm(false)}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default ManageMember;
