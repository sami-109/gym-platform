type CreateMemberProps = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  creating: boolean;

  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;

  onCreate: () => void;
  onClose: () => void;
};

function CreateMember({
  firstName,
  lastName,
  phone,
  email,
  creating,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onEmailChange,
  onCreate,
  onClose,
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

            <label>
              Phone
              <input
                type="text"
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
              />
            </label>
          </div>
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
