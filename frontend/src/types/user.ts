export type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  role: string;
  managedGym?: {
    id: number;
    name: string;
    gymCode: string;
    address: string;
    description: string | null;
  } | null;
};
