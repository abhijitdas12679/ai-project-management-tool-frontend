import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  return (
    <Layout title="Settings">
      <div className="settings-page">
        <section className="settings-hero">
          <div>
            <p className="eyebrow">Workspace Settings</p>
            <h1>Account and platform information</h1>
            <p>
              Review your profile details and application information for the AI
              Project Management Tool.
            </p>
          </div>

          <div className="hero-stat-card">
            <span>Version</span>
            <strong>v1.0</strong>
            <small>Production Ready</small>
          </div>
        </section>

        <div className="settings-grid">
          <section className="premium-card">
            <div className="premium-card-header">
              <div>
                <h2>Profile</h2>
                <p>Your account information is managed by the administrator.</p>
              </div>
            </div>

            <div className="profile-summary-card">
              <div className="profile-avatar">
                {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{user?.full_name || "User"}</h3>
                <p>{user?.email || "No email available"}</p>
              </div>
            </div>

            <div className="premium-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={user?.full_name || ""}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  value={user?.email || ""}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  className="form-input"
                  value={user?.role || ""}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="settings-note">
              Profile editing is not enabled in this version. Contact your
              administrator to update account details.
            </div>
          </section>

          <section className="premium-card">
            <div className="premium-card-header">
              <div>
                <h2>About This Tool</h2>
                <p>AI Project Management Tool for IT delivery teams.</p>
              </div>

              <span className="task-count-badge">v1.0.0</span>
            </div>

            <div className="about-tool-card">
              <h3>Secure AI-powered project workspace</h3>
              <p>
                This dashboard uses AI via Groq to help IT teams generate project
                tasks, summarize meeting notes, and predict delivery risk.
              </p>
              <p>
                All AI calls are made securely from the backend, so API keys are not
                exposed to the browser.
              </p>
            </div>

            <div className="settings-feature-list">
              <div>
                <span>AI</span>
                <strong>Task Generation</strong>
                <p>Convert project scope into structured delivery tasks.</p>
              </div>

              <div>
                <span>MN</span>
                <strong>Meeting Notes</strong>
                <p>Generate professional MOM from raw meeting discussions.</p>
              </div>

              <div>
                <span>RK</span>
                <strong>Risk Prediction</strong>
                <p>Identify delivery risk and recommended mitigation actions.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}