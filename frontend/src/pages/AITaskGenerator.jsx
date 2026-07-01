import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import api, { getErrorMessage } from "../api/api";

export default function AITaskGenerator() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    project_id: "",
    project_title: "",
    project_description: "",
    deadline: "",
    team_size: 3,
    technology_stack: "",
    save: true,
  });
  const [generating, setGenerating] = useState(false);
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
        project_title: project.title,
        project_description: project.description,
        deadline: project.deadline || "",
        team_size: project.team_size || 1,
        technology_stack: project.technology_stack || "",
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
    setGenerating(true);

    try {
      const res = await api.post("/ai/generate-tasks", form);
      setResult(res.data.tasks);

      if (form.save) {
        setSuccess(`${res.data.tasks.length} tasks generated and saved to Tasks.`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout title="AI Task Generator">
      <div className="ai-task-page">
        <div className="ai-task-hero">
          <div>
            <p className="eyebrow">AI Planning Assistant</p>
            <h1>Generate structured project tasks</h1>
            <p>
              Convert project scope, deadline, team size, and tech stack into a clean task
              breakdown ready for execution.
            </p>
          </div>

          <div className="hero-stat-card">
            <span>Output</span>
            <strong>{result ? result.length : 0}</strong>
            <small>Generated Tasks</small>
          </div>
        </div>

        <div className="ai-task-grid">
          <section className="premium-card">
            <div className="premium-card-header">
              <div>
                <h2>Project Details</h2>
                <p>Provide the project context for better AI task planning.</p>
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
                  <option value="">None — describe a new project below</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
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

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea
                  className="form-textarea ai-description"
                  value={form.project_description}
                  onChange={(e) =>
                    setForm({ ...form, project_description: e.target.value })
                  }
                  placeholder="Describe goals, scope, modules, integrations, and expected outcomes..."
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
              </div>

              <div className="form-group">
                <label className="form-label">Technology Stack</label>
                <input
                  className="form-input"
                  placeholder="React, FastAPI, PostgreSQL"
                  value={form.technology_stack}
                  onChange={(e) =>
                    setForm({ ...form, technology_stack: e.target.value })
                  }
                />
              </div>

              <label className="save-option" htmlFor="save-tasks">
                <input
                  type="checkbox"
                  id="save-tasks"
                  checked={form.save}
                  onChange={(e) =>
                    setForm({ ...form, save: e.target.checked })
                  }
                />
                <span>
                  <strong>Save generated tasks</strong>
                  <small>Add generated tasks directly to the Tasks board.</small>
                </span>
              </label>

              <button
                className="btn btn-primary btn-block premium-submit"
                type="submit"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="spinner" />
                    Generating tasks...
                  </>
                ) : (
                  "Generate Tasks"
                )}
              </button>
            </form>
          </section>

          <section className="premium-card results-card">
            <div className="premium-card-header">
              <div>
                <h2>Generated Tasks</h2>
                <p>AI-suggested task breakdown for your project execution plan.</p>
              </div>

              {result && (
                <span className="task-count-badge">{result.length} Tasks</span>
              )}
            </div>

            {generating ? (
              <div className="premium-loading">
                <div className="spinner spinner-dark" />
                <p>Analyzing project scope and preparing task breakdown...</p>
              </div>
            ) : !result ? (
              <div className="premium-empty-state">
                <div className="empty-illustration">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>No tasks generated yet</h3>
                <p>
                  Complete the project details and click Generate Tasks to preview the
                  AI-created task plan here.
                </p>
              </div>
            ) : (
              <div className="generated-task-list">
                {result.map((task, idx) => (
                  <article key={idx} className="generated-task-card">
                    <div className="task-card-top">
                      <div>
                        <span className="task-index">
                          Task {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3>{task.title}</h3>
                      </div>
                      <Badge value={task.priority} />
                    </div>

                    <p>{task.description}</p>

                    <div className="task-meta-grid">
                      <div>
                        <span>Estimate</span>
                        <strong>{task.estimated_hours}h</strong>
                      </div>
                      <div>
                        <span>Owner Role</span>
                        <strong>{task.assigned_role}</strong>
                      </div>
                      <div>
                        <span>Suggested Deadline</span>
                        <strong>{task.deadline_suggestion}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}