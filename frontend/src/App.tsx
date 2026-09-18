import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [user, setUser] = useState<{
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    role: string;
  } | null>(null);

  const handleLogin = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);

      setUser(data.user);

      console.log("First name received:", data.user.firstName);
      console.log("Last name received:", data.user.lastName);

      setMessage("Login successful!");

      console.log("Logged-in user:", data.user);
    } catch {
      setMessage("Could not connect to the server.");
    }
  };

  if (user) {
    return (
      <main className="dashboard">
        <section className="profile-header">
          <div className="profile-icon">👤</div>

          <div>
            <h2>
              {user.firstName} {user.lastName}
            </h2>

            <p>Membership details</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Gym Platform</h1>

        <p className="auth-subtitle">Login to your account</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
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
            />
          </div>

          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </section>
    </main>
  );
}

export default App;
