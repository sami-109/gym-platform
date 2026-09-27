export type CreateMemberProps = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  creating: boolean;
  error: string;
  membershipType: string;

  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMembershipTypeChange: (value: string) => void;

  onCreate: () => void;
  onClose: () => void;
};

export type CreatedMember = {
  memberId: number;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  membershipType: string;
  username: string;
  password: string;
};
