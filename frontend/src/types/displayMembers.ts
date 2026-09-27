import type { Member } from "./member";

export type DisplayMembersProps = {
  members: Member[];
  currentTime: number;
  onAddMember: () => void;
  onManageMember: (memberId: number) => void;
  onDeleteMember: (memberId: number) => void;
};

export type MemberSortBy = "id" | "firstName" | "lastName" | "days";

export type MemberStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "FROZEN"
  | "DEACTIVATED"
  | "EXPIRED";

export type MemberDaysFilter = "ALL" | "LESS_THAN_7";
