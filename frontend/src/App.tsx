import { useState } from "react";
import type { SubmitEventHandler } from "react";

import { generateMealPlan, getMealPlans } from "./api/mealPlans";
import { getMe, loginUser, registerUser } from "./api/auth";
import { getPreferences } from "./api/preferences";
import { clearToken } from "./api/client";
import type { MealPlan, User, UserPreferences } from "./types/api";

function App() {
  const [email, setEmail] = useState("user3@example.com");
  const [password, setPassword] = useState("text1");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

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
      const createdUser = await registerUser({ email, password });

      setUser(createdUser);
      setMessage("Registered successfully. You can log in now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setPreferences(null);
    setMealPlans([]);
    setMessage("Logged out");
  }

  async function handleLoadPreferences() {
    setMessage("");

    try {
      const data = await getPreferences();
      setPreferences(data);
      setMessage("Preferences loaded");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load preferences",
      );
    }
  }

  async function handleGenerateMealPlan() {
    setMessage("");

    try {
      const mealPlan = await generateMealPlan();
      setMealPlans((currentMealPlans) => [mealPlan, ...currentMealPlans]);
      setMessage("Meal plan generated");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not generate meal plan",
      );
    }
  }

  async function handleLoadMealPlans() {
    setMessage("");

    try {
      const data = await getMealPlans();
      setMealPlans(data);
      setMessage("Meal plans loaded");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load meal plans",
      );
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
              <button
                className="button button-ghost"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </form>

          {message && <p className="status-message">{message}</p>}

          {user && (
            <section className="user-card">
              <h3>Current user</h3>
              <pre>{JSON.stringify(user, null, 2)}</pre>

              <div className="button-row">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleLoadPreferences}
                >
                  Load preferences
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleGenerateMealPlan}
                >
                  Generate meal plan
                </button>
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={handleLoadMealPlans}
                >
                  Load meal plans
                </button>
              </div>

              {preferences && (
                <>
                  <h3>Preferences</h3>
                  <pre>{JSON.stringify(preferences, null, 2)}</pre>
                </>
              )}

              {mealPlans.length > 0 && (
                <>
                  <h3>Meal plans</h3>
                  <pre>{JSON.stringify(mealPlans, null, 2)}</pre>
                </>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
