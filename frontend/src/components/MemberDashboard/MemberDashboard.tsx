import { getMembershipDisplay } from "../../utils/membership";
import type { Membership } from "../../types/membership";
import "./MemberDashboard.scss";
import "../../styles/_profile.scss";

type MemberDashboardProps = {
  firstName: string;
  lastName: string;
  membership: Membership | null;
  currentTime: number;
  onLogout: () => void;
};

function MemberDashboard({
  firstName,
  lastName,
  membership,
  currentTime,
  onLogout,
}: MemberDashboardProps) {
  return (
    <div className="member-dashboard">
      <header className="profile-header">
        <div className="profile-details">
          <div className="profile-icon">
            {firstName.charAt(0)}
            {lastName.charAt(0)}
          </div>

          <div>
            <h2>
              {firstName} {lastName}
            </h2>

            {membership && (
              <p>{getMembershipDisplay(membership, currentTime)}</p>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
    </div>
  );
}

export default MemberDashboard;
