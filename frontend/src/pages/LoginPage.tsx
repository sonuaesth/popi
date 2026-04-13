import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { useNavigate } from "react-router-dom";

import { getMe, loginUser, registerUser } from "../api/auth";
import type { User } from "../types/api";

type LoginPageProps = {
  onLogin: (user: User) => void;
};

type AuthMode = "register" | "login";

function LoginPage({ onLogin }: LoginPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("user3@example.com");
  const [password, setPassword] = useState("text1");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isRegisterMode = authMode === "register";

  const handleAuthSubmit: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    if (isRegisterMode) {
      await handleRegister();
      return;
    }

    await handleLogin();
  };

  async function handleLogin() {
    setMessage("");
    setIsSubmitting(true);

    try {
      await loginUser({ email, password });
      const currentUser = await getMe();

      onLogin(currentUser);
      navigate("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister() {
    setMessage("");
    setIsSubmitting(true);

    try {
      await registerUser({
        email,
        password,
        name: name.trim() || null,
      });
      await loginUser({ email, password });
      const currentUser = await getMe();

      onLogin(currentUser);
      navigate("/onboarding");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
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
          <h2>{isRegisterMode ? "Start with Popi." : "Welcome back."}</h2>
          <p>
            {isRegisterMode
              ? "Create your profile so Popi can learn how you like to eat."
              : "Sign in to keep your meal plans, shopping lists, and ratings together."}
          </p>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {isRegisterMode && (
              <label className="field">
                Name
                <input
                  autoComplete="name"
                  placeholder="Sofia"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}

            <label className="field">
              Email
              <input
                autoComplete="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="field">
              Password
              <input
                type="password"
                value={password}
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="button-row">
              <button
                className="button button-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Working..."
                  : isRegisterMode
                    ? "Register"
                    : "Log in"}
              </button>
            </div>
          </form>

          <button
            className="auth-mode-switch"
            type="button"
            onClick={() => {
              setMessage("");
              setAuthMode(isRegisterMode ? "login" : "register");
            }}
          >
            {isRegisterMode
              ? "Already have an account?"
              : "Create a new account"}
          </button>

          {message && <p className="status-message">{message}</p>}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
