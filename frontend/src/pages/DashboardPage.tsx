import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import {
  generateMealPlan,
  getMealPlans,
  getShoppingList,
} from "../api/mealPlans";
import type { MealPlan, ShoppingList, User } from "../types/api";

type DashboardPageProps = {
  user: User;
  onLogout: () => void;
};

type DashboardLocationState = {
  generateMealPlan?: boolean;
};

function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldGenerateMealPlan = Boolean(
    (location.state as DashboardLocationState | null)?.generateMealPlan,
  );
  const handledAutoGenerateRef = useRef(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<Set<string>>(
    () => new Set(),
  );
  const [message, setMessage] = useState("");
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);

  useEffect(() => {
    async function loadLatestPlan() {
      if (shouldGenerateMealPlan && !handledAutoGenerateRef.current) {
        handledAutoGenerateRef.current = true;
        navigate(".", { replace: true, state: null });
        await handleGeneratePlan();
        return;
      }

      try {
        const plans = await getMealPlans();
        const latestPlan = plans[0] ?? null;

        setMealPlan(latestPlan);

        if (latestPlan) {
          const list = await getShoppingList(latestPlan.id);
          setShoppingList(list);
          setCheckedShoppingItems(new Set());
        } else {
          setShoppingList(null);
          setCheckedShoppingItems(new Set());
        }
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load meal plan",
        );
      }
    }

    void loadLatestPlan();
  }, []);

  async function handleGeneratePlan() {
    setMessage("");
    setIsGeneratingMealPlan(true);

    try {
      const plan = await generateMealPlan();
      const list = await getShoppingList(plan.id);

      setMealPlan(plan);
      setShoppingList(list);
      setCheckedShoppingItems(new Set());
      setMessage("Meal plan generated");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not generate meal plan",
      );
    } finally {
      setIsGeneratingMealPlan(false);
    }
  }

  function getShoppingItemKey(item: ShoppingList["items"][number]): string {
    return `${item.name}-${item.amount}-${item.unit}`;
  }

  function toggleShoppingItem(itemKey: string) {
    setCheckedShoppingItems((current) => {
      const next = new Set(current);

      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }

      return next;
    });
  }

  function handleDownloadShoppingListPdf() {
    if (!shoppingList || !mealPlan) {
      return;
    }

    const doc = new jsPDF();
    const margin = 16;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const columnGap = 10;
    const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;
    const columnX = [margin, margin + columnWidth + columnGap];
    const headerBottomY = 42;
    const bottomY = pageHeight - 16;

    let currentColumn = 0;
    let y = 20;

    function addText(
      text: string,
      size = 9,
      font: "normal" | "bold" = "normal",
      x = margin,
      maxTextWidth = pageWidth - margin * 2,
    ) {
      doc.setFont("helvetica", font);
      doc.setFontSize(size);

      const lines = doc.splitTextToSize(text, maxTextWidth);

      lines.forEach((line: string) => {
        if (y > pageHeight - 16) {
          doc.addPage();
          y = 20;
        }

        doc.text(line, x, y);
        y += size * 0.5;
      });

      y += 3;
    }

    addText("Popi shopping list", 14, "bold");
    addText(mealPlan.title, 9, "normal");

    y = headerBottomY;

    shoppingList.items.forEach((item) => {
      const sourceMeals = item.source_meals.join(", ");
      const itemTitle = `${item.name}: ${item.amount} ${item.unit}`;
      const titleLines = doc.splitTextToSize(itemTitle, columnWidth);
      const sourceLines = sourceMeals
        ? doc.splitTextToSize(`For: ${sourceMeals}`, columnWidth)
        : [];
      const itemHeight = titleLines.length * 4.5 + sourceLines.length * 4 + 6;

      if (y + itemHeight > bottomY) {
        if (currentColumn === 0) {
          currentColumn = 1;
          y = headerBottomY;
        } else {
          doc.addPage();
          currentColumn = 0;
          y = 20;
        }
      }

      const x = columnX[currentColumn];

      addText(itemTitle, 9, "bold", x, columnWidth);

      if (sourceMeals) {
        addText(`For: ${sourceMeals}`, 8, "normal", x, columnWidth);
      }
    });

    doc.save("popi-shopping-list.pdf");
  }

  return (
    <main className="app-shell">
      <section className="dashboard-page">
        <nav className="app-nav">
          <strong>Popi</strong>
          <Link to="/">Today</Link>
          <Link to="/ratings">Ratings</Link>
          <Link to="/profile">Profile</Link>
          <button className="button button-ghost" type="button" onClick={onLogout}>
            Log out
          </button>
        </nav>

        <div className="form-heading">
          <p className="eyebrow">Today</p>
          <h2>Meal plan for {user.name || user.email}</h2>
        </div>

        <button
          className="button button-primary"
          type="button"
          onClick={handleGeneratePlan}
          disabled={isGeneratingMealPlan}
        >
          {isGeneratingMealPlan ? "Generating..." : "Generate today's plan"}
        </button>

        {message && <p className="status-message">{message}</p>}

        {isGeneratingMealPlan && (
          <section className="generation-status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <div>
              <h3>Popi is building your plan</h3>
              <p>This can take a moment while recipes and shopping list sync.</p>
            </div>
          </section>
        )}

        {mealPlan && (
          <section className="meal-preview">
            <article className="meal-preview-card">
              <p className="eyebrow">Plan #{mealPlan.id}</p>
              <h4>{mealPlan.title}</h4>
              <p>{mealPlan.notes}</p>
              <div className="meal-item-list">
                {mealPlan.items.map((item) => (
                  <Link
                    className="meal-item-button"
                    key={item.id}
                    to={`/meal-items/${item.id}`}
                  >
                    <span>{item.meal_type}</span>
                    <strong>{item.recipe_name}</strong>
                  </Link>
                ))}
              </div>
            </article>

            {shoppingList && (
                <article className="shopping-list-card">
                  <div className="shopping-list-header">
                    <div>
                      <p className="eyebrow">Shopping list</p>
                      <h4>For today's plan</h4>
                    </div>

                    <button
                      className="button button-ghost shopping-list-pdf-button"
                      type="button"
                      onClick={handleDownloadShoppingListPdf}
                    >
                      Save PDF
                    </button>
                  </div>
                <ul>
                  {shoppingList.items.map((item) => {
                    const itemKey = getShoppingItemKey(item);
                    const isChecked = checkedShoppingItems.has(itemKey);

                    return (
                      <li
                        className={isChecked ? "is-checked" : ""}
                        key={itemKey}
                      >
                        <label className="shopping-list-item">
                          <input
                            checked={isChecked}
                            type="checkbox"
                            onChange={() => toggleShoppingItem(itemKey)}
                          />
                          <span>
                            {item.name}: {item.amount} {item.unit}
                          </span>
                          {item.source_meals.length > 0 && (
                            <small>{item.source_meals.join(", ")}</small>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </article>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default DashboardPage;
