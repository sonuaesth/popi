import { useState } from "react";
import type { SubmitEventHandler } from "react";

import { getMe, loginUser, registerUser } from "./api/auth";
import { clearToken } from "./api/client";
import OnboardingPage from "./pages/OnboardingPage";
import type { User } from "./types/api";

function App() {
  const [email, setEmail] = useState("user3@example.com");
  const [password, setPassword] = useState("text1");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  const handleLogin: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await loginUser({ email, password });
      const currentUser = await getMe();

      setUser(currentUser);
      setMessage("Logged in successfully");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    }
  };

  async function handleRegister() {
    setMessage("");

    try {
      await registerUser({ email, password });
      await loginUser({ email, password });
      const currentUser = await getMe();

      setUser(currentUser);
      setMessage("Account created. Tell Popi what you like to eat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setMessage("Logged out");
  }

  if (user) {
    return <OnboardingPage user={user} onLogout={handleLogout} />;
  }

  return (
    <main className="app-shell">
      <section className="auth-card" aria-label="Authentication">
        <div className="brand-panel">
          <p className="eyebrow">AI meal planner</p>
          <h1 className="brand-title">Popi</h1>
          <p className="brand-copy">
            A warm pantry companion for personal meal plans, shopping lists, and
            saved favorites.
          </p>
        </div>

        <div className="auth-panel">
          <h2>Plan meals around you.</h2>
          <p>
            Sign in to keep your preferences, generated plans, shopping lists,
            and recipe ratings together.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="field">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="field">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="button-row">
              <button className="button button-primary" type="submit">
                Log in
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
          </form>

          {message && <p className="status-message">{message}</p>}
        </div>
      </section>
    </main>
  );
}

export default App;
