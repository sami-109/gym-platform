export type MemberCredentialsProps = {
  memberId: number | null;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  membershipType?: string;
  username: string;
  password: string;
  title?: string;

  onClose: () => void;
};
