import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  acceptFamilyInvite,
  createFamily,
  createFamilyInvite,
  getFamilyInvites,
  getFamilyMembers,
  getMyFamily,
  getMyFamilyInvites,
} from "../api/families";
import type { Family, FamilyInvite, FamilyMember, User } from "../types/api";

type FamilyPageProps = {
  user: User;
};

function FamilyPage({ user }: FamilyPageProps) {
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyInvites, setFamilyInvites] = useState<FamilyInvite[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<FamilyInvite[]>([]);
  const [familyName, setFamilyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState<number | null>(null);

  useEffect(() => {
    void loadFamilyPage();
  }, []);

  async function loadFamilyPage() {
    setIsLoading(true);
    setMessage("");

    try {
      const invitesForMe = await getMyFamilyInvites();
      setIncomingInvites(invitesForMe);

      try {
        const currentFamily = await getMyFamily();
        setFamily(currentFamily);

        const [familyMembers, sentInvites] = await Promise.all([
          getFamilyMembers(),
          getFamilyInvites(),
        ]);

        setMembers(familyMembers);
        setFamilyInvites(sentInvites);
      } catch (error) {
        if (error instanceof Error && error.message === "Family not found") {
          setFamily(null);
          setMembers([]);
          setFamilyInvites([]);
        } else {
          throw error;
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load family page",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateFamily() {
    if (!familyName.trim()) {
      setMessage("Enter a family name");
      return;
    }

    setMessage("");
    setIsCreatingFamily(true);

    try {
      await createFamily(familyName.trim());
      setFamilyName("");
      setMessage("Family created");
      await loadFamilyPage();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create family",
      );
    } finally {
      setIsCreatingFamily(false);
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim()) {
      setMessage("Enter an email to invite");
      return;
    }

    setMessage("");
    setIsSendingInvite(true);

    try {
      await createFamilyInvite(inviteEmail.trim());
      setInviteEmail("");
      setMessage("Invite sent");
      await loadFamilyPage();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not send invite",
      );
    } finally {
      setIsSendingInvite(false);
    }
  }

  async function handleAcceptInvite(inviteId: number) {
    setMessage("");
    setAcceptingInviteId(inviteId);

    try {
      await acceptFamilyInvite(inviteId);
      setMessage("Invite accepted. Switch to family mode in profile when ready.");
      await loadFamilyPage();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not accept invite",
      );
    } finally {
      setAcceptingInviteId(null);
    }
  }

  const currentModeLabel =
    user.active_profile_mode === "family" ? "Family mode" : "Personal mode";

  return (
    <main className="app-shell">
      <section className="dashboard-page">
        <nav className="app-nav">
          <strong>Popi</strong>
          <Link to="/">Today</Link>
          <Link to="/ratings">Ratings</Link>
          <Link to="/family">Family</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        <div className="form-heading">
          <p className="eyebrow">Family</p>
          <h2>Shared meals, one table</h2>
        </div>

        <section className="family-hero-card">
          <div>
            <p className="eyebrow">Current mode</p>
            <h3>{currentModeLabel}</h3>
            <p>
              Personal mode keeps your plan private. Family mode shares one meal
              plan and shopping list with your household.
            </p>
          </div>
          <Link className="button button-primary" to="/profile">
            Change mode in profile
          </Link>
        </section>

        {message && <p className="status-message">{message}</p>}

        {isLoading ? (
          <section className="family-section-card">
            <p>Loading family space...</p>
          </section>
        ) : (
          <section className="family-page-grid">
            <article className="family-section-card">
              <div className="family-section-header">
                <div>
                  <p className="eyebrow">Your family</p>
                  <h3>{family ? family.name : "No family yet"}</h3>
                </div>
              </div>

              {family ? (
                <div className="family-summary-copy">
                  <p>
                    Shared meal plans and shopping lists will appear for everyone
                    in this family when family mode is on.
                  </p>
                </div>
              ) : (
                <div className="family-form">
                  <label className="field">
                    Family name
                    <input
                      placeholder="The Popi House"
                      value={familyName}
                      onChange={(event) => setFamilyName(event.target.value)}
                    />
                  </label>

                  <button
                    className="button button-primary"
                    type="button"
                    onClick={handleCreateFamily}
                    disabled={isCreatingFamily}
                  >
                    {isCreatingFamily ? "Creating..." : "Create family"}
                  </button>
                </div>
              )}
            </article>

            <article className="family-section-card">
              <div className="family-section-header">
                <div>
                  <p className="eyebrow">Incoming invites</p>
                  <h3>Join a family</h3>
                </div>
              </div>

              {incomingInvites.length > 0 ? (
                <div className="family-list">
                  {incomingInvites.map((invite) => (
                    <div className="family-list-item" key={invite.id}>
                      <div>
                        <strong>Family #{invite.family_id}</strong>
                        <p>{invite.email}</p>
                      </div>
                      <button
                        className="button button-secondary"
                        type="button"
                        onClick={() => handleAcceptInvite(invite.id)}
                        disabled={acceptingInviteId === invite.id || Boolean(family)}
                      >
                        {acceptingInviteId === invite.id ? "Joining..." : "Accept"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="family-empty-copy">No pending invites yet.</p>
              )}
            </article>

            <article className="family-section-card family-section-wide">
              <div className="family-section-header">
                <div>
                  <p className="eyebrow">Members</p>
                  <h3>Who is sharing this plan</h3>
                </div>
              </div>

              {family ? (
                members.length > 0 ? (
                  <div className="family-list">
                    {members.map((member) => (
                      <div className="family-list-item" key={member.id}>
                        <div>
                          <strong>{member.user.name || member.user.email}</strong>
                          <p>{member.user.email}</p>
                        </div>
                        <span className="family-role-badge">{member.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="family-empty-copy">No members yet.</p>
                )
              ) : (
                <p className="family-empty-copy">
                  Create a family or accept an invite to start sharing plans.
                </p>
              )}
            </article>

            <article className="family-section-card family-section-wide">
              <div className="family-section-header">
                <div>
                  <p className="eyebrow">Invites</p>
                  <h3>Bring someone in</h3>
                </div>
              </div>

              {family ? (
                <>
                  <div className="family-form family-inline-form">
                    <label className="field">
                      Invite by email
                      <input
                        placeholder="friend@example.com"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                      />
                    </label>

                    <button
                      className="button button-primary"
                      type="button"
                      onClick={handleSendInvite}
                      disabled={isSendingInvite}
                    >
                      {isSendingInvite ? "Sending..." : "Send invite"}
                    </button>
                  </div>

                  {familyInvites.length > 0 ? (
                    <div className="family-list">
                      {familyInvites.map((invite) => (
                        <div className="family-list-item" key={invite.id}>
                          <div>
                            <strong>{invite.email}</strong>
                            <p>Status: {invite.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="family-empty-copy">No invites sent yet.</p>
                  )}
                </>
              ) : (
                <p className="family-empty-copy">
                  You can send invites after creating your family.
                </p>
              )}
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

export default FamilyPage;
