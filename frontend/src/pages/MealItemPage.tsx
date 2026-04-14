import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getMealPlans } from "../api/mealPlans";
import type { MealPlan, MealPlanItem } from "../types/api";

type MealItemPageProps = {
  onLogout: () => void;
};

type SelectedMeal = {
  plan: MealPlan;
  item: MealPlanItem;
};

function MealItemPage({ onLogout }: MealItemPageProps) {
  const { itemId } = useParams();
  const [selectedMeal, setSelectedMeal] = useState<SelectedMeal | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMealItem() {
      setMessage("");

      try {
        const plans = await getMealPlans();
        const numericItemId = Number(itemId);
        const match = plans
          .map((plan) => ({
            plan,
            item: plan.items.find((mealItem) => mealItem.id === numericItemId),
          }))
          .find((result) => result.item);

        if (!match?.item) {
          setSelectedMeal(null);
          setMessage("Meal details not found");
          return;
        }

        setSelectedMeal({ plan: match.plan, item: match.item });
      } catch (error) {
        setSelectedMeal(null);
        setMessage(
          error instanceof Error ? error.message : "Could not load meal details",
        );
      }
    }

    void loadMealItem();
  }, [itemId]);

  return (
    <main className="app-shell">
      <section className="dashboard-page">
        <nav className="app-nav">
          <strong>Popi</strong>
          <Link to="/">Today</Link>
          <Link to="/ratings">Ratings</Link>
          <Link to="/profile">Profile</Link>
          <button
            className="button button-ghost"
            type="button"
            onClick={onLogout}
          >
            Log out
          </button>
        </nav>

        <Link className="button button-ghost" to="/">
          Back to meal plan
        </Link>

        {message && <p className="status-message">{message}</p>}

        {selectedMeal && (
          <article className="meal-detail-card meal-detail-page-card">
            <div>
              <p className="eyebrow">Plan #{selectedMeal.plan.id}</p>
              <h3>{selectedMeal.item.recipe_name}</h3>
              <p>
                {selectedMeal.item.meal_type} - {selectedMeal.item.difficulty}
                {selectedMeal.item.estimated_minutes
                  ? ` - ${selectedMeal.item.estimated_minutes} min`
                  : ""}
              </p>
            </div>

            <div className="meal-detail-grid">
              <section>
                <h4>Ingredients</h4>
                <ul>
                  {selectedMeal.item.ingredients.map((ingredient) => (
                    <li key={`${ingredient.name}-${ingredient.unit}`}>
                      {ingredient.name}: {ingredient.amount} {ingredient.unit}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4>Instructions</h4>
                <ol>
                  {selectedMeal.item.instructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ol>
              </section>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

export default MealItemPage;
