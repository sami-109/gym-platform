import type { Membership } from "./membership";

export type MemberDashboardProps = {
  firstName: string;
  lastName: string;
  membership: Membership | null;
  currentTime: number;
  onLogout: () => void;
};
