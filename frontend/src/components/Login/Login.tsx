import "./Login.scss";
import Loading from "../Loading/Loading";
import { Eye, EyeOff } from "lucide-react";

type LoginProps = {
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

function Login({
  username,
  password,
  showPassword,
  message,
  loggingIn,
  onUsernameChange,
  onPasswordChange,
  onLogin,
  onShowPasswordChange,
}: LoginProps) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Gym Platform</h1>

        <p className="auth-subtitle">Login to your account</p>

        {loggingIn ? (
          <Loading message="Logging in..." />
        ) : (
          <>
            <form onSubmit={onLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>

                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => onUsernameChange(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                  />

                  <button
                    type="button"
                    className="password-visibility-button"
                    onClick={() => onShowPasswordChange(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit">Login</button>
            </form>

            {message && <p>{message}</p>}
          </>
        )}
      </section>
    </main>
  );
}

export default Login;
