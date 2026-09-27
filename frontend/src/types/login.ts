export type LoginProps = {
  username: string;
  password: string;
  showPassword: boolean;
  message: string;
  loggingIn: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onShowPasswordChange: (value: boolean) => void;
  onLogin: (event: React.SyntheticEvent<HTMLFormElement>) => void;
};
