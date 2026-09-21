type LoginProps = {
  username: string;
  password: string;
  message: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: (event: React.SyntheticEvent<HTMLFormElement>) => void;
};

function Login({
  username,
  password,
  message,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}: LoginProps) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Gym Platform</h1>

        <p className="auth-subtitle">Login to your account</p>

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

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
          </div>

          <button type="submit">Login</button>
        </form>

        {message && <p>{message}</p>}
      </section>
    </main>
  );
}

export default Login;
