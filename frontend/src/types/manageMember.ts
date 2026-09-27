import type { Member } from "./member";

export type ManageMemberProps = {
  member: Member;
  currentTime: number;
  firstName: string;
  isRetrievingCredentials: boolean;
  lastName: string;
  applyingChanges: boolean;
  phone: string;
  email: string;
  startDate: string;
  expiryDate: string;
  action: string;
  error: string;

  showRetrieveConfirm: boolean;
  openRetrieveCredentials: () => void;
  closeRetrieveCredentials: () => void;
  confirmRetrieveCredentials: (memberId: number) => Promise<void>;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onActionChange: (value: string) => void;

  onApply: () => void;
  onClose: () => void;
};
