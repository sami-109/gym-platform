import "./AdminDashboard.scss";
import "../../styles/_profile.scss";

type AdminDashboardProps = {
  firstName: string;
  lastName: string;
  gymName: string;
  children: React.ReactNode;
};

function AdminDashboard({
  firstName,
  lastName,
  gymName,
  children,
}: AdminDashboardProps) {
  return (
    <div className="dashboard">
      <header className="profile-header">
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
      </header>

      {children}
    </div>
  );
}

export default AdminDashboard;
