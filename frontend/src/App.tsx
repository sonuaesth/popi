import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { clearToken } from "./api/client";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import MealItemPage from "./pages/MealItemPage";
import ProfilePage from "./pages/ProfilePage";
import RatingsPage from "./pages/RatingsPage";
import type { User } from "./types/api";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    setUser(null);
    navigate("/login");
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
      <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
