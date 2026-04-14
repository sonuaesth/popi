import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMealPlans } from "../api/mealPlans";
import { getMyRatings, rateMealPlanItem } from "../api/ratings";
import type { MealPlan } from "../types/api";

function RatingsPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<
    Record<number, number>
  >({});
  const [message, setMessage] = useState("");

useEffect(() => {
  async function loadRatingsPage() {
    try {
      const [plans, ratings] = await Promise.all([
        getMealPlans(),
        getMyRatings(),
      ]);

      setMealPlans(plans);

      const ratingsByItemId = Object.fromEntries(
        ratings.map((rating) => [
          rating.meal_plan_item_id,
          rating.rating,
        ]),
      );

      setSelectedRatings(ratingsByItemId);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load ratings",
      );
    }
  }

  void loadRatingsPage();
}, []);


  async function handleRate(itemId: number, rating: number) {
    try {
      const savedRating = await rateMealPlanItem(itemId, { rating });

      setSelectedRatings((current) => ({
        ...current,
        [itemId]: savedRating.rating,
      }));
      setMessage("Rating saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save rating");
    }
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
                      className={`button rating-button${
                        selectedRatings[item.id] === rating
                          ? " is-selected"
                          : ""
                      }`}
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
