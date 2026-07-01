import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import api, { getErrorMessage } from "../api/api";

const emptyForm = {
  project_id: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  estimated_hours: 4,
  assigned_role: "",
  deadline_suggestion: "",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
      ]);

      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const projectTitle = (id) =>
    projects.find((project) => String(project.id) === String(id))?.title ||
    "Unassigned";

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({
      project_id: task.project_id || "",
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      estimated_hours: task.estimated_hours || 0,
      assigned_role: task.assigned_role || "",
      deadline_suggestion: task.deadline_suggestion || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = { ...form, project_id: form.project_id || null };

      if (editing) {
        await api.put(`/tasks/${editing.id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;

    try {
      await api.delete(`/tasks/${task.id}`);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const quickStatusChange = async (task, status) => {
    try {
      await api.put(`/tasks/${task.id}`, { status });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredTasks =
    statusFilter === "All"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length;
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;
  const blockedTasks = tasks.filter((task) => task.status === "Blocked").length;

  return (
    <Layout title="Tasks">
      <div className="tasks-page">
        {error && <div className="alert alert-error">{error}</div>}

        <section className="tasks-hero">
          <div>
            <p className="eyebrow">Task Control Center</p>
            <h1>Manage project execution tasks</h1>
            <p>
              Track priorities, ownership, estimated effort, delivery status, and project
              alignment from one professional workspace.
            </p>
          </div>

          <button className="btn btn-primary" onClick={openCreate}>
            New Task
          </button>
        </section>

        <section className="premium-kpi-grid">
          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-blue">
              <span>TT</span>
            </div>
            <div>
              <p>Total Tasks</p>
              <h2>{tasks.length}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-green">
              <span>DN</span>
            </div>
            <div>
              <p>Completed</p>
              <h2>{completedTasks}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-amber">
              <span>IP</span>
            </div>
            <div>
              <p>In Progress</p>
              <h2>{inProgressTasks}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-red">
              <span>BK</span>
            </div>
            <div>
              <p>Blocked</p>
              <h2>{blockedTasks}</h2>
            </div>
          </div>
        </section>

        <section className="premium-card">
          <div className="premium-card-header tasks-header">
            <div>
              <h2>All Tasks</h2>
              <p>Track task progress, project mapping, priority, ownership, and status.</p>
            </div>

            <div className="tasks-toolbar">
              <select
                className="form-select tasks-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Blocked</option>
              </select>

              <button className="btn btn-primary btn-sm" onClick={openCreate}>
                New Task
              </button>
            </div>
          </div>

          <div className="tasks-summary-strip">
            <div>
              <span>Showing</span>
              <strong>{filteredTasks.length}</strong>
              <small>Filtered Tasks</small>
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
              <small>Need Attention</small>
            </div>

            <div>
              <span>Estimated Effort</span>
              <strong>
                {tasks.reduce(
                  (total, task) => total + Number(task.estimated_hours || 0),
                  0
                )}
                h
              </strong>
              <small>Total Hours</small>
            </div>
          </div>

          {loading ? (
            <div className="premium-loading compact-loading">
              <div className="spinner spinner-dark" />
              <p>Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="premium-empty-state compact-empty">
              <div className="empty-illustration">
                <span />
                <span />
                <span />
              </div>
              <h3>No tasks found</h3>
              <p>
                Create a new task or change the status filter to view existing task
                records.
              </p>
              <button className="btn btn-primary btn-sm" onClick={openCreate}>
                Create Task
              </button>
            </div>
          ) : (
            <div className="premium-table-wrap">
              <table className="premium-table tasks-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Est. Hours</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <strong>{task.title}</strong>
                        <div className="task-description-preview">
                          {task.description?.slice(0, 72) || "No description added"}
                          {task.description?.length > 72 ? "…" : ""}
                        </div>
                      </td>

                      <td className="text-muted">{projectTitle(task.project_id)}</td>

                      <td>
                        <Badge value={task.priority} />
                      </td>

                      <td>
                        <span className="table-soft-pill">
                          {task.estimated_hours || 0}h
                        </span>
                      </td>

                      <td className="text-muted">{task.assigned_role || "—"}</td>

                      <td>
                        <select
                          className="form-select task-status-select"
                          value={task.status}
                          onChange={(e) => quickStatusChange(task, e.target.value)}
                        >
                          <option>Pending</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                          <option>Blocked</option>
                        </select>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(task)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(task)}
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
            title={editing ? "Edit Task" : "New Task"}
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
                    "Save Task"
                  )}
                </button>
              </>
            }
          >
            <form onSubmit={handleSave} className="premium-form task-modal-form">
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Build authentication API"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea task-description-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the task scope, expected output, dependencies, and acceptance criteria..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project</label>
                <select
                  className="form-select"
                  value={form.project_id}
                  onChange={(e) =>
                    setForm({ ...form, project_id: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row responsive-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
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
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Blocked</option>
                  </select>
                </div>
              </div>

              <div className="form-row responsive-row">
                <div className="form-group">
                  <label className="form-label">Estimated Hours</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={form.estimated_hours}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimated_hours: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Role</label>
                  <input
                    className="form-input"
                    placeholder="Backend Developer"
                    value={form.assigned_role}
                    onChange={(e) =>
                      setForm({ ...form, assigned_role: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deadline Suggestion</label>
                <input
                  className="form-input"
                  placeholder="Week 2"
                  value={form.deadline_suggestion}
                  onChange={(e) =>
                    setForm({ ...form, deadline_suggestion: e.target.value })
                  }
                />
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
}