export type DashboardSection = "memberships" | "transactions" | "activity-log";

export type SidebarProps = {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
};
