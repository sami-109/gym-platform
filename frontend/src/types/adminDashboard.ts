export type AdminDashboardProps = {
  firstName: string;
  lastName: string;
  gymName: string;
  onLogout: () => void;
  children: React.ReactNode;
};
