import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import api, { getErrorMessage } from "../api/api";

export default function RiskPrediction() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    project_id: "",
    project_title: "",
    deadline: "",
    current_progress: 50,
    blockers: "",
    team_size: 3,
    complexity: "Medium",
    save: true,
  });
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data))
      .catch(() => {});
  }, []);

  const handleProjectSelect = (id) => {
    const project = projects.find((p) => String(p.id) === String(id));

    if (project) {
      setForm({
        ...form,
        project_id: id,
        project_title: project.title || "",
        deadline: project.deadline || "",
        team_size: project.team_size || 1,
      });
    } else {
      setForm({ ...form, project_id: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResult(null);
    setPredicting(true);

    try {
      const res = await api.post("/ai/predict-risk", form);
      setResult(res.data);

      if (form.save) {
        setSuccess("Risk prediction generated and saved.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPredicting(false);
    }
  };

  return (
    <Layout title="Risk Prediction">
      <div className="risk-page">
        <section className="risk-hero">
          <div>
            <p className="eyebrow">AI Risk Intelligence</p>
            <h1>Predict delivery risk before it impacts execution</h1>
            <p>
              Analyze project progress, blockers, complexity, team size, and deadline
              pressure to generate a professional risk assessment and mitigation plan.
            </p>
          </div>

          <div className="hero-stat-card">
            <span>Assessment</span>
            <strong>{result ? result.risk_level : "Pending"}</strong>
            <small>{result ? "Risk Level" : "Awaiting Input"}</small>
          </div>
        </section>

        <div className="risk-grid">
          <section className="premium-card">
            <div className="premium-card-header">
              <div>
                <h2>Project Risk Input</h2>
                <p>Enter current project status for AI-driven risk analysis.</p>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-group">
                <label className="form-label">Link to Existing Project</label>
                <select
                  className="form-select"
                  value={form.project_id}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                >
                  <option value="">None — describe manually</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  className="form-input"
                  value={form.project_title}
                  onChange={(e) =>
                    setForm({ ...form, project_title: e.target.value })
                  }
                  placeholder="e.g. Customer Portal Revamp"
                  required
                />
              </div>

              <div className="form-row responsive-row">
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="form-input"
                    value={form.current_progress}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        current_progress: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="risk-progress-preview">
                <div className="risk-progress-header">
                  <span>Progress Snapshot</span>
                  <strong>{form.current_progress}%</strong>
                </div>
                <div className="risk-progress-track">
                  <span style={{ width: `${form.current_progress}%` }} />
                </div>
              </div>

              <div className="form-row responsive-row">
                <div className="form-group">
                  <label className="form-label">Team Size</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={form.team_size}
                    onChange={(e) =>
                      setForm({ ...form, team_size: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Complexity</label>
                  <select
                    className="form-select"
                    value={form.complexity}
                    onChange={(e) =>
                      setForm({ ...form, complexity: e.target.value })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Very High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current Blockers</label>
                <textarea
                  className="form-textarea risk-blockers-textarea"
                  placeholder="Describe blockers, dependency delays, scope changes, resource issues, technical risks, or client-side pending items..."
                  value={form.blockers}
                  onChange={(e) =>
                    setForm({ ...form, blockers: e.target.value })
                  }
                />
              </div>

              <label className="save-option" htmlFor="save-risk">
                <input
                  type="checkbox"
                  id="save-risk"
                  checked={form.save}
                  onChange={(e) =>
                    setForm({ ...form, save: e.target.checked })
                  }
                />
                <span>
                  <strong>Save this prediction</strong>
                  <small>Store this risk assessment in prediction history.</small>
                </span>
              </label>

              <button
                className="btn btn-primary btn-block premium-submit"
                type="submit"
                disabled={predicting}
              >
                {predicting ? (
                  <>
                    <span className="spinner" />
                    Predicting risk...
                  </>
                ) : (
                  "Predict Risk"
                )}
              </button>
            </form>
          </section>

          <section className="premium-card risk-output-card">
            <div className="premium-card-header">
              <div>
                <h2>Risk Assessment</h2>
                <p>AI-generated risk level, reasons, impact, and mitigation plan.</p>
              </div>

              {result && <Badge value={result.risk_level} />}
            </div>

            {predicting ? (
              <div className="premium-loading">
                <div className="spinner spinner-dark" />
                <p>Analyzing delivery risk and preparing mitigation plan...</p>
              </div>
            ) : !result ? (
              <div className="premium-empty-state">
                <div className="empty-illustration">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>No risk assessment yet</h3>
                <p>
                  Complete the project risk input and run prediction to see the
                  AI-generated assessment here.
                </p>
              </div>
            ) : (
              <div className="risk-result-list">
                <section className="risk-level-panel">
                  <div>
                    <span>Risk Level</span>
                    <h3>{result.risk_level}</h3>
                  </div>
                  <Badge value={result.risk_level} />
                </section>

                <section className="risk-result-block">
                  <div className="risk-section-header">
                    <span>01</span>
                    <h3>Risk Reasons</h3>
                  </div>
                  <ul className="premium-list">
                    {result.risk_reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </section>

                <section className="risk-result-block">
                  <div className="risk-section-header">
                    <span>02</span>
                    <h3>Possible Impact</h3>
                  </div>
                  <p>{result.possible_impact}</p>
                </section>

                <section className="risk-result-block">
                  <div className="risk-section-header">
                    <span>03</span>
                    <h3>Mitigation Plan</h3>
                  </div>
                  <ul className="premium-list">
                    {result.mitigation_plan.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="risk-result-block">
                  <div className="risk-section-header">
                    <span>04</span>
                    <h3>Recommended Next Actions</h3>
                  </div>
                  <ul className="premium-list">
                    {result.recommended_next_actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}