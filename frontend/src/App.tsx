import { useEffect, useState } from "react";
import "./App.css";

const getMembershipTimeRemaining = (
  expiryDate: string,
  currentTime: number,
) => {
  const remainingMilliseconds = new Date(expiryDate).getTime() - currentTime;

  if (remainingMilliseconds <= 0) {
    return "Membership expired";
  }

  const totalMinutes = Math.floor(remainingMilliseconds / (1000 * 60));

  const days = Math.floor(totalMinutes / (60 * 24));

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} remaining`;
  }

  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} remaining`;
  }

  const minutes = totalMinutes;

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"} remaining`;
};

const getMembershipDisplay = (
  membership: {
    status: string;
    expiryDate: string | null;
  },
  currentTime: number,
) => {
  if (membership.status === "FROZEN") {
    return "Membership Frozen";
  }

  if (!membership.expiryDate) {
    return "Membership expired";
  }

  return getMembershipTimeRemaining(membership.expiryDate, currentTime);
};

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [user, setUser] = useState<{
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    role: string;
  } | null>(null);

  const [membership, setMembership] = useState<{
    id: number;
    status: string;
    startDate: string;
    expiryDate: string | null;
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchMembership = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/members/me/membership",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          console.log("Membership fetch failed:", data);
          return;
        }

        setMembership(data.membership);
        console.log("Membership received:", data.membership);
      } catch (error) {
        console.log("Could not fetch membership:", error);
      }
    };

    fetchMembership();
  }, [user]);

  if (user) {
    return (
      <main className="dashboard">
        <section className="profile-header">
          <div className="profile-icon">👤</div>

          <div>
            <h2>
              {user.firstName} {user.lastName}
            </h2>

            <p>
              {membership
                ? getMembershipDisplay(membership, currentTime)
                : "Loading membership..."}
            </p>
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
