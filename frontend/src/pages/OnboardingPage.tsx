import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";

import { generateMealPlan, getMealPlans } from "../api/mealPlans";
import { getPreferences, updatePreferences } from "../api/preferences";
import type { MealPlan, User, UserPreferences } from "../types/api";

type OnboardingStep = "basics" | "products" | "cuisines" | "complete";

type SwipeDirection = "left" | "right";

type SwipeItem = {
  id: string;
  label: string;
};

type PreferencesForm = {
  weight_kg: string;
  activity_level: string;
  diet_type: string;
  allergies: string;
  goal: string;
  disliked_products: string;
  favorite_products: string;
  excluded_products: string;
  preferred_cuisines: string;
  cooking_difficulty: string;
  meals_per_day: number;
};

type OnboardingPageProps = {
  user: User;
  onLogout: () => void;
};

const emptyPreferencesForm: PreferencesForm = {
  weight_kg: "",
  activity_level: "moderate",
  diet_type: "balanced",
  allergies: "",
  goal: "balanced nutrition",
  disliked_products: "",
  favorite_products: "",
  excluded_products: "",
  preferred_cuisines: "",
  cooking_difficulty: "easy",
  meals_per_day: 3,
};

const productCards: SwipeItem[] = [
  { id: "chicken", label: "Chicken" },
  { id: "eggs", label: "Eggs" },
  { id: "rice", label: "Rice" },
  { id: "tomatoes", label: "Tomatoes" },
  { id: "mushrooms", label: "Mushrooms" },
  { id: "olives", label: "Olives" },
  { id: "salmon", label: "Salmon" },
  { id: "tofu", label: "Tofu" },
  { id: "pepper", label: "Pepper" },
  { id: "onions", label: "Onions" },
  { id: "spinach", label: "Spinach" },
  { id: "broccoli", label: "Broccoli" },
  { id: "cucumber", label: "Cucumber" },
  { id: "carrots", label: "Carrots" },
  { id: "peas", label: "Peas" },
  { id: "bacon", label: "Bacon" },
  { id: "cheese", label: "Cheese" },
  { id: "pork", label: "Pork" },
  { id: "beef", label: "Beef" },
  { id: "lamb", label: "Lamb" },
  { id: "beans", label: "Beans" },
  { id: "lentils", label: "Lentils" },
  { id: "quinoa", label: "Quinoa" },
  { id: "couscous", label: "Couscous" },
  { id: "noodles", label: "Noodles" },
  { id: "pasta", label: "Pasta" },
  { id: "bread", label: "Bread" },
  { id: "milk", label: "Milk" },
  { id: "yogurt", label: "Yogurt" },
  { id: "juice", label: "Juice" },
  { id: "water", label: "Water" },
  { id: "honey", label: "Honey" },
];

const cuisineCards: SwipeItem[] = [
  { id: "italian", label: "Italian" },
  { id: "japanese", label: "Japanese" },
  { id: "mexican", label: "Mexican" },
  { id: "indian", label: "Indian" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "korean", label: "Korean" },
  { id: "thai", label: "Thai" },
  { id: "french", label: "French" },
  { id: "chinese", label: "Chinese" },
  { id: "american", label: "American" },
  { id: "spanish", label: "Spanish" },
  { id: "greek", label: "Greek" },
  { id: "vietnamese", label: "Vietnamese" },
  { id: "turkish", label: "Turkish" },
  { id: "lebanese", label: "Lebanese" },
  { id: "british", label: "British" },
  { id: "caribbean", label: "Caribbean" },
  { id: "african", label: "African" },
  { id: "german", label: "German" },
  { id: "jamaican", label: "Jamaican" },
  { id: "cuban", label: "Cuban" },
  { id: "venezuelan", label: "Venezuelan" },
  { id: "colombian", label: "Colombian" },
  { id: "peruvian", label: "Peruvian" },
  { id: "chilean", label: "Chilean" },
  { id: "argentinean", label: "Argentinean" },
  { id: "brazilian", label: "Brazilian" },
];

const swipeThreshold = 90;
const swipeExitDistance = 560;

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
    weight_kg: preferences.weight_kg?.toString() ?? "",
    activity_level: preferences.activity_level,
    diet_type: preferences.diet_type,
    allergies: listToInput(preferences.allergies),
    goal: preferences.goal,
    disliked_products: listToInput(preferences.disliked_products),
    favorite_products: listToInput(preferences.favorite_products),
    excluded_products: listToInput(preferences.excluded_products),
    preferred_cuisines: listToInput(preferences.preferred_cuisines),
    cooking_difficulty: preferences.cooking_difficulty,
    meals_per_day: preferences.meals_per_day,
  };
}

function OnboardingPage({ user, onLogout }: OnboardingPageProps) {
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesForm, setPreferencesForm] =
    useState<PreferencesForm>(emptyPreferencesForm);
  const [onboardingStep, setOnboardingStep] =
    useState<OnboardingStep>("basics");
  const [productIndex, setProductIndex] = useState(0);
  const [cuisineIndex, setCuisineIndex] = useState(0);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeExitDirection, setSwipeExitDirection] =
    useState<SwipeDirection | null>(null);
  const dragOffsetXRef = useRef(0);

  const currentProduct = productCards[productIndex];
  const currentCuisine = cuisineCards[cuisineIndex];
  const swipeRotation = dragOffsetX / 18;
  const swipeCardStyle: CSSProperties = {
    transform: `translateX(${dragOffsetX}px) rotate(${swipeRotation}deg)`,
  };

  useEffect(() => {
    async function loadExistingPreferences() {
      try {
        const data = await getPreferences();
        setPreferences(data);
        setPreferencesForm(preferencesToForm(data));
        setOnboardingStep("complete");
      } catch {
        setPreferences(null);
        setPreferencesForm(emptyPreferencesForm);
        setOnboardingStep("basics");
      }
    }

    void loadExistingPreferences();
  }, []);

  useEffect(() => {
    setDragStartX(null);
    updateDragOffsetX(0);
    setIsDragging(false);
    setSwipeExitDirection(null);
  }, [onboardingStep, productIndex, cuisineIndex]);

  function updateDragOffsetX(offsetX: number) {
    dragOffsetXRef.current = offsetX;
    setDragOffsetX(offsetX);
  }

  function animateSwipe(direction: SwipeDirection, onComplete: () => void) {
    if (swipeExitDirection) {
      return;
    }

    setSwipeExitDirection(direction);
    setIsDragging(false);
    setDragStartX(null);
    updateDragOffsetX(
      direction === "right" ? swipeExitDistance : -swipeExitDistance,
    );

    window.setTimeout(() => {
      onComplete();
      updateDragOffsetX(0);
      setSwipeExitDirection(null);
    }, 220);
  }

  function handleSwipeCardPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (swipeExitDirection) {
      return;
    }

    setDragStartX(event.clientX);
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSwipeCardPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX === null || swipeExitDirection) {
      return;
    }

    updateDragOffsetX(event.clientX - dragStartX);
  }

  function handleSwipeCardPointerEnd() {
    if (dragStartX === null) {
      return;
    }

    const finalOffsetX = dragOffsetXRef.current;
    setDragStartX(null);
    setIsDragging(false);

    if (Math.abs(finalOffsetX) < swipeThreshold) {
      updateDragOffsetX(0);
      return;
    }

    if (onboardingStep === "products") {
      animateSwipe(finalOffsetX > 0 ? "right" : "left", () =>
        handleProductAnswer(finalOffsetX > 0 ? "like" : "dislike"),
      );
      return;
    }

    if (onboardingStep === "cuisines") {
      animateSwipe(finalOffsetX > 0 ? "right" : "left", () =>
        handleCuisineAnswer(finalOffsetX > 0 ? "like" : "skip"),
      );
    }
  }

  function handleProductAnswer(answer: "like" | "dislike" | "skip") {
    if (!currentProduct) {
      return;
    }

    setPreferencesForm((current) => {
      const favoriteProducts = inputToList(current.favorite_products);
      const dislikedProducts = inputToList(current.disliked_products);

      return {
        ...current,
        favorite_products:
          answer === "like"
            ? listToInput([...favoriteProducts, currentProduct.label])
            : current.favorite_products,
        disliked_products:
          answer === "dislike"
            ? listToInput([...dislikedProducts, currentProduct.label])
            : current.disliked_products,
      };
    });

    const nextIndex = productIndex + 1;

    if (nextIndex >= productCards.length) {
      setOnboardingStep("cuisines");
    } else {
      setProductIndex(nextIndex);
    }
  }

  function handleCuisineAnswer(answer: "like" | "skip") {
    if (!currentCuisine) {
      return;
    }

    setPreferencesForm((current) => {
      const preferredCuisines = inputToList(current.preferred_cuisines);

      return {
        ...current,
        preferred_cuisines:
          answer === "like"
            ? listToInput([...preferredCuisines, currentCuisine.label])
            : current.preferred_cuisines,
      };
    });

    const nextIndex = cuisineIndex + 1;

    if (nextIndex >= cuisineCards.length) {
      setOnboardingStep("complete");
    } else {
      setCuisineIndex(nextIndex);
    }
  }

  async function handleFinishOnboarding() {
    setMessage("");

    try {
      const data = await updatePreferences({
        weight_kg: preferencesForm.weight_kg
          ? Number(preferencesForm.weight_kg)
          : null,
        activity_level: preferencesForm.activity_level,
        diet_type: preferencesForm.diet_type,
        allergies: inputToList(preferencesForm.allergies),
        goal: preferencesForm.goal,
        disliked_products: inputToList(preferencesForm.disliked_products),
        favorite_products: inputToList(preferencesForm.favorite_products),
        excluded_products: inputToList(preferencesForm.excluded_products),
        preferred_cuisines: inputToList(preferencesForm.preferred_cuisines),
        cooking_difficulty: preferencesForm.cooking_difficulty,
        meals_per_day: preferencesForm.meals_per_day,
      });

      setPreferences(data);
      setPreferencesForm(preferencesToForm(data));
      setMessage("Preferences saved");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save preferences",
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
      <section className="preferences-card" aria-label="Meal preferences">
        <div className="preferences-hero">
          <p className="eyebrow">Preferences</p>
          <h1 className="brand-title">Build your plate.</h1>
          <p className="brand-copy">
            Hi, {user.email}. Tell Popi your basics first, then generate a meal
            plan that fits your routine.
          </p>
          <button
            className="button button-ghost preferences-logout"
            type="button"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>

        <div className="preferences-form">
          {onboardingStep === "basics" && (
            <>
              <div className="form-heading">
                <p className="eyebrow">Step 1</p>
                <h2>Your food profile</h2>
              </div>

              <div className="question-grid">
                <label className="field">
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

                <label className="field">
                  Activity level
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

                <label className="field">
                  Diet type
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

                <label className="field">
                  Allergies
                  <input
                    placeholder="peanuts, lactose, shellfish"
                    value={preferencesForm.allergies}
                    onChange={(event) =>
                      setPreferencesForm((current) => ({
                        ...current,
                        allergies: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field field-wide">
                  Goal
                  <input
                    placeholder="balanced nutrition, weight loss, muscle gain"
                    value={preferencesForm.goal}
                    onChange={(event) =>
                      setPreferencesForm((current) => ({
                        ...current,
                        goal: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
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

                <label className="field">
                  Meals per day
                  <input
                    min="1"
                    max="6"
                    type="number"
                    value={preferencesForm.meals_per_day}
                    onChange={(event) =>
                      setPreferencesForm((current) => ({
                        ...current,
                        meals_per_day: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <div className="button-row">
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => setOnboardingStep("products")}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {onboardingStep === "products" && currentProduct && (
            <>
              <div className="form-heading">
                <p className="eyebrow">Step 2</p>
                <h2>Pick products</h2>
              </div>

              <p className="step-copy">
                Swipe right for yes, left for no. Like what you want to see
                more often.
              </p>

                <div
                  className={`swipe-card${isDragging ? " is-dragging" : ""}${
                    swipeExitDirection ? " is-exiting" : ""
                  }`}
                  style={swipeCardStyle}
                  onPointerDown={handleSwipeCardPointerDown}
                  onPointerMove={handleSwipeCardPointerMove}
                  onPointerUp={handleSwipeCardPointerEnd}
                  onPointerCancel={handleSwipeCardPointerEnd}
                >
                  <span
                    className={`swipe-badge swipe-badge-no${
                      dragOffsetX < -24 ? " is-visible" : ""
                    }`}
                  >
                    No
                  </span>
                  <span
                    className={`swipe-badge swipe-badge-yes${
                      dragOffsetX > 24 ? " is-visible" : ""
                    }`}
                  >
                    Yes
                  </span>
                  <p className="swipe-progress">
                    {productIndex + 1} / {productCards.length}
                  </p>
                  <h3>{currentProduct.label}</h3>
                </div>

              <div className="button-row">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    animateSwipe("left", () => handleProductAnswer("dislike"))
                  }
                >
                  No
                </button>
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => handleProductAnswer("skip")}
                >
                  Skip
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() =>
                    animateSwipe("right", () => handleProductAnswer("like"))
                  }
                >
                  Like
                </button>
              </div>
            </>
          )}

          {onboardingStep === "cuisines" && currentCuisine && (
            <>
              <div className="form-heading">
                <p className="eyebrow">Step 3</p>
                <h2>Pick cuisines</h2>
              </div>

              <p className="step-copy">
                Swipe right for yes, left for no. Choose the cuisines you want
                your meal plans to lean toward.
              </p>

                <div
                  className={`swipe-card${isDragging ? " is-dragging" : ""}${
                    swipeExitDirection ? " is-exiting" : ""
                  }`}
                  style={swipeCardStyle}
                  onPointerDown={handleSwipeCardPointerDown}
                  onPointerMove={handleSwipeCardPointerMove}
                  onPointerUp={handleSwipeCardPointerEnd}
                  onPointerCancel={handleSwipeCardPointerEnd}
                >
                  <span
                    className={`swipe-badge swipe-badge-no${
                      dragOffsetX < -24 ? " is-visible" : ""
                    }`}
                  >
                    No
                  </span>
                  <span
                    className={`swipe-badge swipe-badge-yes${
                      dragOffsetX > 24 ? " is-visible" : ""
                    }`}
                  >
                    Yes
                  </span>
                  <p className="swipe-progress">
                    {cuisineIndex + 1} / {cuisineCards.length}
                  </p>
                <h3>{currentCuisine.label}</h3>
              </div>

              <div className="button-row">
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() =>
                    animateSwipe("left", () => handleCuisineAnswer("skip"))
                  }
                >
                  No
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() =>
                    animateSwipe("right", () => handleCuisineAnswer("like"))
                  }
                >
                  Like
                </button>
              </div>
            </>
          )}

          {onboardingStep === "complete" && (
            <>
              <div className="form-heading">
                <p className="eyebrow">Done</p>
                <h2>Ready to plan</h2>
              </div>

              <div className="preference-summary">
                <p>
                  Favorite products:{" "}
                  {preferencesForm.favorite_products || "Nothing selected yet"}
                </p>
                <p>
                  Disliked products:{" "}
                  {preferencesForm.disliked_products || "Nothing selected yet"}
                </p>
                <p>
                  Preferred cuisines:{" "}
                  {preferencesForm.preferred_cuisines ||
                    "Nothing selected yet"}
                </p>
              </div>

              <div className="button-row">
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => setOnboardingStep("products")}
                >
                  Edit products
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={handleFinishOnboarding}
                >
                  Save preferences
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleGenerateMealPlan}
                  disabled={!preferences}
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
            </>
          )}

          {message && <p className="status-message">{message}</p>}

          {mealPlans.length > 0 && (
            <section className="meal-preview">
              <h3>Latest plans</h3>
              {mealPlans.map((mealPlan) => (
                <article className="meal-preview-card" key={mealPlan.id}>
                  <p className="eyebrow">Plan #{mealPlan.id}</p>
                  <h4>{mealPlan.title}</h4>
                  <p>{mealPlan.notes}</p>
                  <ul>
                    {mealPlan.items.map((item) => (
                      <li key={item.id}>{item.recipe_name}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default OnboardingPage;
