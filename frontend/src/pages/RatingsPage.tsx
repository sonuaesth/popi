import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMealPlans } from "../api/mealPlans";
import { rateMealPlanItem } from "../api/ratings";
import type { MealPlan } from "../types/api";

function RatingsPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPlans() {
      const plans = await getMealPlans();
      setMealPlans(plans);
    }

    void loadPlans();
  }, []);

  async function handleRate(itemId: number, rating: number) {
    await rateMealPlanItem(itemId, { rating });
    setMessage("Rating saved");
  }

  return (
    <main className="app-shell">
      <section className="dashboard-page">
        <nav className="app-nav">
          <strong>Popi</strong>
          <Link to="/">Today</Link>
          <Link to="/ratings">Ratings</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        <div className="form-heading">
          <p className="eyebrow">Ratings</p>
          <h2>Rate your meals</h2>
        </div>

        {message && <p className="status-message">{message}</p>}

        <section className="meal-preview">
          {mealPlans.flatMap((plan) =>
            plan.items.map((item) => (
              <article className="meal-preview-card" key={item.id}>
                <h4>{item.recipe_name}</h4>
                <div className="button-row">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      className="button button-ghost"
                      type="button"
                      key={rating}
                      onClick={() => handleRate(item.id, rating)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </article>
            )),
          )}
        </section>
      </section>
    </main>
  );
}

export default RatingsPage;
