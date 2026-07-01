import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Demo@1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

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
            <h1>Plan projects faster with AI-powered delivery control.</h1>
            <p>
              Manage projects, generate tasks, monitor risk, and keep your IT delivery
              team aligned from one premium workspace.
            </p>
          </div>

          <div className="auth-feature-grid">
            <div>
              <strong>AI Task Planning</strong>
              <span>Generate structured tasks from project scope.</span>
            </div>
            <div>
              <strong>Risk Prediction</strong>
              <span>Track high-risk projects before delivery delays happen.</span>
            </div>
            <div>
              <strong>Team Visibility</strong>
              <span>Monitor progress, priorities, and task completion.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card premium-auth-card">
          <div className="auth-card-header">
            <p className="auth-eyebrow">Secure Login</p>
            <h2>Welcome back</h2>
            <p>Sign in to continue managing your IT projects.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="premium-auth-form">
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
              <div className="auth-label-row">
                <label className="form-label">Password</label>
              </div>

              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="demo-hint premium-demo-hint">
            <span>Demo Credentials</span>
            <strong>demo@example.com</strong>
            <small>Demo@1234</small>
          </div>

          <div className="auth-switch premium-auth-switch">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </section>
    </main>
  );
}