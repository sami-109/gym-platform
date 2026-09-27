export type ActivityLog = {
  id: number;
  memberId: number | null;
  memberFirstName: string | null;
  memberLastName: string | null;
  gymId: number | null;
  performedByUserId: number | null;
  action: string;
  details: string | null;
  createdAt: string;

  member: {
    firstName: string;
    lastName: string;
  } | null;

  performedBy: {
    firstName: string;
    lastName: string;
    username: string;
  } | null;
};
