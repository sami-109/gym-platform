import "./AdminDashboard.scss";
import "../../styles/_profile.scss";
import Sidebar from "../Sidebar/Sidebar";
import { useState } from "react";
import Transactions from "../Transactions/Transactions";
import ActivityLog from "../ActivityLog/ActivityLog";

type AdminDashboardProps = {
  firstName: string;
  lastName: string;
  gymName: string;
  onLogout: () => void;
  children: React.ReactNode;
};

function AdminDashboard({
  firstName,
  lastName,
  gymName,
  onLogout,
  children,
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("memberships");
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

          {activeSection === "transactions" && <Transactions />}

          {activeSection === "activity-log" && <ActivityLog />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
