import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Member } from "../../types/member";
import { getMembershipDisplay } from "../../utils/membership";
import PhoneInput from "../PhoneInput/PhoneInput";
import "../../styles/_modal.scss";
import "./ManageMember.scss";

type ManageMemberProps = {
  member: Member;
  currentTime: number;

  firstName: string;
  lastName: string;
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
  email,
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
  return (
    <div className="modal-backdrop">
      <section className="manage-member-modal">
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
          <h3>Personal Information</h3>

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
                  <strong>{getMembershipDisplay(member, currentTime)}</strong>
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
      </section>
    </div>
  );
}

export default ManageMember;
