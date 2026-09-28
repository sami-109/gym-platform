export type TransactionDateFilter = "1-day" | "1-week" | "1-month" | "custom";

export type TransactionEditState = {
  action: string;
  amountPaid: string;
  transactionDate: Date | null;
};

export type MembershipPriceState = {
  dayPass: string;
  trial: string;
  oneMonth: string;
};

export type Transaction = {
  id: number;
  transactionNumber: number;
  memberId: number | null;
  memberFirstName: string | null;
  memberLastName: string | null;
  gymId: number;
  performedByUserId: number | null;
  action: string;
  transactionDate: string;
  startDate: string | null;
  endDate: string | null;
  amountPaid: string;
  profit: string;
  details: string | null;
  createdAt: string;
  member: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
};
