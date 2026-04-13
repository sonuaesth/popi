import { Link } from "react-router-dom";
import type { User } from "../types/api";

type ProfilePageProps = {
  user: User;
  onLogout: () => void;
};

function ProfilePage({ user, onLogout }: ProfilePageProps) {
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

        <div className="profile-main-actions">
          <Link className="button button-primary" to="/onboarding">
            Edit preferences
          </Link>
        </div>

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
