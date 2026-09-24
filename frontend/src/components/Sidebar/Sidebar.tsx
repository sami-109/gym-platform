import "./Sidebar.scss";

type SidebarProps = {
  activeSection: string;
  onSectionChange: (section: string) => void;
};

function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button
        type="button"
        className={activeSection === "memberships" ? "active" : ""}
        onClick={() => onSectionChange("memberships")}
      >
        Memberships
      </button>

      <button
        type="button"
        className={activeSection === "transactions" ? "active" : ""}
        onClick={() => onSectionChange("transactions")}
      >
        Transactions
      </button>

      <button
        type="button"
        className={activeSection === "activity-log" ? "active" : ""}
        onClick={() => onSectionChange("activity-log")}
      >
        Activity Log
      </button>
    </aside>
  );
}

export default Sidebar;
