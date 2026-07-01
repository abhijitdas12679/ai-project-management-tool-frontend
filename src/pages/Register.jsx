import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(fullName, email, password);

    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <main className="auth-premium-shell">
      <section className="auth-premium-panel">
        <div className="auth-panel-content">
          <div className="auth-logo-row">
            <div className="auth-logo-mark">AP</div>
            <span>AI PM Tool</span>
          </div>

          <div>
            <p className="auth-eyebrow">Enterprise Project Workspace</p>
            <h1>Start managing IT delivery with AI assistance.</h1>
            <p>
              Create your account to manage projects, generate task plans, track
              risks, and keep your delivery team aligned.
            </p>
          </div>

          <div className="auth-feature-grid">
            <div>
              <strong>Project Control</strong>
              <span>Manage project scope, team size, deadlines, and status.</span>
            </div>
            <div>
              <strong>AI Task Generation</strong>
              <span>Break project requirements into structured tasks.</span>
            </div>
            <div>
              <strong>Delivery Insights</strong>
              <span>Track progress, priorities, and high-risk projects.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card premium-auth-card">
          <div className="auth-card-header">
            <p className="auth-eyebrow">Create Account</p>
            <h2>Get started</h2>
            <p>Set up your workspace and begin managing IT projects.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="premium-auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-block premium-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-switch premium-auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}