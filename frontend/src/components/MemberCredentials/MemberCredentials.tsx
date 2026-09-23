import "../../styles/_modal.scss";
import "./MemberCredentials.scss";

type MemberCredentialsProps = {
  memberId: number | null;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  membershipType: string;
  username: string;
  password: string;

  onClose: () => void;
};

function MemberCredentials({
  memberId,
  memberName,
  memberPhone,
  memberEmail,
  membershipType,
  username,
  password,
  onClose,
}: MemberCredentialsProps) {
  const membershipTypeDisplay =
    {
      "1-month": "1 Month",
      trial: "Trial",
      "day-pass": "Day Pass",
    }[membershipType] || membershipType;
  return (
    <div className="modal-backdrop">
      <div className="manage-member-modal">
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>Member Created Successfully</h2>

        <div className="form-section">
          <h3>Member Information</h3>

          <div className="credentials-display">
            <p>
              <strong>Member ID:</strong> {memberId}
            </p>

            <p>
              <strong>Full Name:</strong> {memberName}
            </p>

            <p>
              <strong>Mobile:</strong> {memberPhone}
            </p>

            <p>
              <strong>Email:</strong> {memberEmail || "Not provided"}
            </p>

            <p>
              <strong>Membership:</strong> {membershipTypeDisplay}
            </p>
          </div>
        </div>

        <div className="form-section">
          <h3>Login Credentials</h3>

          <div className="credentials-display">
            <p>
              <strong>Username:</strong> {username}
            </p>

            <p>
              <strong>Password:</strong> {password}
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberCredentials;
