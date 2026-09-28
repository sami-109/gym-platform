export type ActivityLog = {
  id: number;
  transactionId: number | null;
  memberId: number | null;
  memberFirstName: string | null;
  memberLastName: string | null;
  gymId: number | null;
  performedByUserId: number | null;
  action: string;
  details: string | null;
  activityDate: string;
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

  transaction: {
    id: number;
    transactionNumber: number;
    action: string;
    amountPaid: string;
    transactionDate: string;
  } | null;
};

export type ActivityFilter = "all" | "member" | "transaction";
