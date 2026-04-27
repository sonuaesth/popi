import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { getMe } from "./api/auth";
import { clearToken, getToken } from "./api/client";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import MealItemPage from "./pages/MealItemPage";
import ProfilePage from "./pages/ProfilePage";
import RatingsPage from "./pages/RatingsPage";
import FamilyPage from "./pages/FamilyPage";
import type { User } from "./types/api";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
  async function restoreUser() {
    const token = getToken();

    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    try {
      const currentUser = await getMe();
      setUser(currentUser);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }

  void restoreUser();
}, []);


  function handleLogout() {
    clearToken();
    setUser(null);
    navigate("/login");
  }

  if (isAuthLoading) {
  return (
    <main className="app-shell">
      <p className="status-message">Loading...</p>
    </main>
  );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage user={user} onLogout={handleLogout} />} />
      <Route path="/meal-items/:itemId" element={<MealItemPage onLogout={handleLogout} />} />
      <Route path="/onboarding" element={<OnboardingPage user={user} onLogout={handleLogout} />} />
      <Route path="/ratings" element={<RatingsPage />} />
      <Route
        path="/family"
        element={<FamilyPage user={user} />}
      />
      <Route
        path="/profile"
        element={
          <ProfilePage
            user={user}
            onLogout={handleLogout}
            onUserUpdate={setUser}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
