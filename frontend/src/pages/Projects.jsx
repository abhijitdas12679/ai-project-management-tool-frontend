import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import api, { getErrorMessage } from "../api/api";

const emptyForm = {
  title: "",
  description: "",
  technology_stack: "",
  team_size: 1,
  deadline: "",
  status: "Active",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title || "",
      description: project.description || "",
      technology_stack: project.technology_stack || "",
      team_size: project.team_size || 1,
      deadline: project.deadline || "",
      status: project.status || "Active",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editing) {
        await api.put(`/projects/${editing.id}`, form);
      } else {
        await api.post("/projects", form);
      }

      setModalOpen(false);
      await loadProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/projects/${project.id}`);
      await loadProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const onHoldProjects = projects.filter((p) => p.status === "On Hold").length;

  return (
    <Layout title="Projects">
      <div className="projects-page">
        {error && <div className="alert alert-error">{error}</div>}

        <section className="projects-hero">
          <div>
            <p className="eyebrow">Project Portfolio</p>
            <h1>Manage IT project lifecycle</h1>
            <p>
              Create, update, track, and organize all delivery projects from one
              professional workspace.
            </p>
          </div>

          <button className="btn btn-primary" onClick={openCreate}>
            New Project
          </button>
        </section>

        <section className="premium-kpi-grid">
          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-blue">
              <span>TP</span>
            </div>
            <div>
              <p>Total Projects</p>
              <h2>{projects.length}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-green">
              <span>AC</span>
            </div>
            <div>
              <p>Active Projects</p>
              <h2>{activeProjects}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-amber">
              <span>OH</span>
            </div>
            <div>
              <p>On Hold</p>
              <h2>{onHoldProjects}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-green">
              <span>DN</span>
            </div>
            <div>
              <p>Completed</p>
              <h2>{completedProjects}</h2>
            </div>
          </div>
        </section>

        <section className="premium-card">
          <div className="premium-card-header">
            <div>
              <h2>All Projects</h2>
              <p>Manage project scope, team size, technology stack, and delivery status.</p>
            </div>

            <button className="btn btn-primary btn-sm" onClick={openCreate}>
              New Project
            </button>
          </div>

          {loading ? (
            <div className="premium-loading compact-loading">
              <div className="spinner spinner-dark" />
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="premium-empty-state compact-empty">
              <div className="empty-illustration">
                <span />
                <span />
                <span />
              </div>
              <h3>No projects yet</h3>
              <p>Create your first project to start managing your delivery pipeline.</p>
              <button className="btn btn-primary btn-sm" onClick={openCreate}>
                Create Project
              </button>
            </div>
          ) : (
            <div className="premium-table-wrap">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Tech Stack</th>
                    <th>Team</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.title}</strong>
                        <div className="project-description-preview">
                          {project.description?.slice(0, 72) || "No description added"}
                          {project.description?.length > 72 ? "…" : ""}
                        </div>
                      </td>

                      <td className="text-muted">
                        {project.technology_stack || "—"}
                      </td>

                      <td>
                        <span className="table-soft-pill">
                          {project.team_size || 1} Member
                          {(project.team_size || 1) > 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="text-muted">{project.deadline || "—"}</td>

                      <td>
                        <Badge value={project.status} />
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(project)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(project)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {modalOpen && (
          <Modal
            title={editing ? "Edit Project" : "New Project"}
            onClose={() => setModalOpen(false)}
            footer={
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner" />
                      Saving...
                    </>
                  ) : (
                    "Save Project"
                  )}
                </button>
              </>
            }
          >
            <form onSubmit={handleSave} className="premium-form project-modal-form">
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Customer Portal Revamp"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea project-description-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the project goal, scope, modules, and expected outcome..."
                />
              </div>

              <div className="form-row responsive-row">
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
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>Active</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
}