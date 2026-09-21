export type Member = {
  id: number;
  userId: number;
  gymId: number;
  status: string;
  startDate: string;
  expiryDate: string | null;
  freezeStartDate: string | null;
  frozenRemainingSeconds: number | null;

  user: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    status: string;
    username: string;
  };

  gym: {
    id: number;
    name: string;
    gymCode: string;
  };
};
