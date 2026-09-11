import { useState } from "react";
import "./App.css";

type AuthMode = "login" | "register";

interface AuthResponse {
  message?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

function App() {
  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRegistering = mode === "register";

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegistering
        ? "http://localhost:3000/api/auth/admin/register"
        : "http://localhost:3000/api/auth/login";

      const requestBody = isRegistering
        ? {
            name,
            email,
            password,
          }
        : {
            email,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const text = await response.text();

      console.log("Status:", response.status);
      console.log("Response:", text);

      const data: AuthResponse = JSON.parse(text);

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setSuccess(
        isRegistering
          ? "Admin account created successfully."
          : "Login successful.",
      );

      if (!isRegistering) {
        console.log("Logged-in user:", data.user);

        // Redirect to the admin dashboard later.
        // window.location.href = "/dashboard";
      }

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegistering ? "login" : "register");

    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Gym Platform</h1>

        <p className="auth-subtitle">
          {isRegistering
            ? "Create an admin account"
            : "Login to your admin account"}
        </p>

        {error && <div className="message error-message">{error}</div>}

        {success && <div className="message success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Name</label>

              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>

              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegistering
                ? "Register Admin"
                : "Login"}
          </button>
        </form>

        <button className="switch-button" onClick={switchMode}>
          {isRegistering
            ? "Already have an admin account? Login"
            : "Need to register an admin account?"}
        </button>
      </section>
    </main>
  );
}

export default App;
