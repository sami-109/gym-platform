export type ConfirmModalProps = {
  title: string;
  memberName: string;
  memberId: number;
  isLoading: boolean;
  isLoadingMessage?: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};
