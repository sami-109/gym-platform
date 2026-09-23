import "../../styles/_modal.scss";
import PhoneInput from "../../components/PhoneInput/PhoneInput";

type CreateMemberProps = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  creating: boolean;
  error: string;
  membershipType: string;

  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMembershipTypeChange: (value: string) => void;

  onCreate: () => void;
  onClose: () => void;
};

function CreateMember({
  firstName,
  lastName,
  phone,
  email,
  membershipType,
  creating,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onEmailChange,
  onCreate,
  onClose,
  onMembershipTypeChange,
  error,
}: CreateMemberProps) {
  return (
    <div className="modal-backdrop">
      <div className="manage-member-modal">
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>Add Member</h2>

        <div className="form-section">
          <h3>Member Information</h3>

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

          <label>
            Membership Type
            <select
              value={membershipType}
              onChange={(event) => onMembershipTypeChange(event.target.value)}
            >
              <option value="1-month">1 Month</option>
              <option value="trial">Trial</option>
              <option value="day-pass">Day Pass</option>
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button type="button" onClick={onCreate} disabled={creating}>
            {creating ? "Creating..." : "Create Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateMember;
