import "./AdminDashboard.scss";
import "../../styles/_profile.scss";
import Sidebar from "../Sidebar/Sidebar";
import MembershipTransactions from "../MembershipTransactions/MembershipTransactions";
import ActivityLog from "../ActivityLog/ActivityLog";
import type { AdminDashboardProps } from "../../types/adminDashboard.ts";
import useDashboard from "../../hooks/useDashboard.ts";

function AdminDashboard({
  firstName,
  lastName,
  gymName,

  onLogout,
  children,
}: AdminDashboardProps) {
  const { activeSection, setActiveSection } = useDashboard();

  return (
    <div className="dashboard">
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

            <p>{gymName}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="dashboard-main">
          {activeSection === "memberships" && children}

          {activeSection === "transactions" && <MembershipTransactions />}

          {activeSection === "activity-log" && <ActivityLog />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
