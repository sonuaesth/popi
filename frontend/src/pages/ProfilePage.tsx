import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getPreferences, updatePreferences } from "../api/preferences";
import type { User, UserPreferences } from "../types/api";

type ProfilePageProps = {
  user: User;
  onLogout: () => void;
};

type PreferencesForm = {
  goal: string;
  diet_type: string;
  activity_level: string;
  meals_per_day: number;
  cooking_difficulty: string;
  favorite_products: string;
  disliked_products: string;
  excluded_products: string;
  preferred_cuisines: string;
  allergies: string;
  weight_kg: string;
};

const emptyPreferencesForm: PreferencesForm = {
  goal: "",
  diet_type: "balanced",
  activity_level: "moderate",
  meals_per_day: 3,
  cooking_difficulty: "easy",
  favorite_products: "",
  disliked_products: "",
  excluded_products: "",
  preferred_cuisines: "",
  allergies: "",
  weight_kg: "",
};

function listToInput(value: string[]): string {
  return value.join(", ");
}

function inputToList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function preferencesToForm(preferences: UserPreferences): PreferencesForm {
  return {
    goal: preferences.goal,
    diet_type: preferences.diet_type,
    activity_level: preferences.activity_level,
    meals_per_day: preferences.meals_per_day,
    cooking_difficulty: preferences.cooking_difficulty,
    favorite_products: listToInput(preferences.favorite_products),
    disliked_products: listToInput(preferences.disliked_products),
    excluded_products: listToInput(preferences.excluded_products),
    preferred_cuisines: listToInput(preferences.preferred_cuisines),
    allergies: listToInput(preferences.allergies),
    weight_kg: preferences.weight_kg?.toString() ?? "",
  };
}

function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesForm, setPreferencesForm] =
    useState<PreferencesForm>(emptyPreferencesForm);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      setMessage("");

      try {
        const data = await getPreferences();
        setPreferences(data);
        setPreferencesForm(preferencesToForm(data));
      } catch {
        setPreferences(null);
        setPreferencesForm(emptyPreferencesForm);
        setMessage("Food profile is not set yet");
      }
    }

    void loadPreferences();
  }, []);

  async function handleSavePreferences() {
    setMessage("");
    setIsSaving(true);

    try {
      const data = await updatePreferences({
        goal: preferencesForm.goal,
        diet_type: preferencesForm.diet_type,
        activity_level: preferencesForm.activity_level,
        meals_per_day: preferencesForm.meals_per_day,
        cooking_difficulty: preferencesForm.cooking_difficulty,
        favorite_products: inputToList(preferencesForm.favorite_products),
        disliked_products: inputToList(preferencesForm.disliked_products),
        excluded_products: inputToList(preferencesForm.excluded_products),
        preferred_cuisines: inputToList(preferencesForm.preferred_cuisines),
        allergies: inputToList(preferencesForm.allergies),
        weight_kg: preferencesForm.weight_kg
          ? Number(preferencesForm.weight_kg)
          : null,
      });

      setPreferences(data);
      setPreferencesForm(preferencesToForm(data));
      setMessage("Preferences saved");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save preferences",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard-page profile-page">
        <nav className="app-nav">
          <strong>Popi</strong>
          <Link to="/">Today</Link>
          <Link to="/ratings">Ratings</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        <div className="form-heading">
          <p className="eyebrow">Profile</p>
          <h2>{user.name || user.email}</h2>
        </div>

        {user.name && <p className="profile-email">{user.email}</p>}

        <section className="food-profile-summary">
          <div className="food-profile-summary-heading">
            <p className="eyebrow">Food profile</p>
            <h3>How Popi plans for you</h3>
          </div>

          {preferences ? (
            <div className="editable-preferences-grid">
              <label className="preference-edit-field">
                Goal
                <input
                  value={preferencesForm.goal}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      goal: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="preference-edit-field">
                Diet
                <select
                  value={preferencesForm.diet_type}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      diet_type: event.target.value,
                    }))
                  }
                >
                  <option value="balanced">Balanced</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="high protein">High protein</option>
                  <option value="low carb">Low carb</option>
                </select>
              </label>

              <label className="preference-edit-field">
                Activity
                <select
                  value={preferencesForm.activity_level}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      activity_level: event.target.value,
                    }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label className="preference-edit-field">
                Meals per day
                <input
                  min="1"
                  max="6"
                  type="number"
                  value={preferencesForm.meals_per_day}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      meals_per_day: Number(event.target.value) || 1,
                    }))
                  }
                />
              </label>

              <label className="preference-edit-field">
                Cooking difficulty
                <select
                  value={preferencesForm.cooking_difficulty}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      cooking_difficulty: event.target.value,
                    }))
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label className="preference-edit-field">
                Weight, kg
                <input
                  min="1"
                  type="number"
                  value={preferencesForm.weight_kg}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      weight_kg: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          ) : (
            <p className="food-profile-empty">{message}</p>
          )}
        </section>

        {preferences && (
          <section className="food-preferences-summary">
            <div className="food-profile-summary-heading">
              <p className="eyebrow">Preferences</p>
              <h3>What Popi remembers</h3>
            </div>

            <div className="preference-list-grid">
              <label className="preference-edit-field">
                Favorite products
                <textarea
                  value={preferencesForm.favorite_products}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      favorite_products: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="preference-edit-field">
                Disliked products
                <textarea
                  value={preferencesForm.disliked_products}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      disliked_products: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="preference-edit-field">
                Strict exclusions
                <textarea
                  value={preferencesForm.excluded_products}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      excluded_products: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="preference-edit-field">
                Preferred cuisines
                <textarea
                  value={preferencesForm.preferred_cuisines}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      preferred_cuisines: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="preference-edit-field">
                Allergies
                <textarea
                  value={preferencesForm.allergies}
                  onChange={(event) =>
                    setPreferencesForm((current) => ({
                      ...current,
                      allergies: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          </section>
        )}

        <div className="profile-main-actions">
          {preferences ? (
            <button
              className="button button-primary"
              type="button"
              onClick={handleSavePreferences}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          ) : (
            <Link className="button button-primary" to="/onboarding">
              Set preferences
            </Link>
          )}
        </div>

        {message && <p className="status-message">{message}</p>}

        <div className="profile-bottom-actions">
          <button className="button button-ghost" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;
