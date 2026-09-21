import { useState } from "react";
import type { User } from "../types/user";

function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);

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

      const meResponse = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const meData = await meResponse.json();

      if (meResponse.ok) {
        setUser(meData.user);
      }

      setMessage("Login successful!");
    } catch {
      setMessage("Could not connect to the server.");
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    message,
    user,
    handleLogin,
  };
}

export default useLogin;
