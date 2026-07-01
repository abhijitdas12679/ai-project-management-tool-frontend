import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import api, { getErrorMessage } from "../api/api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [projectsRes, tasksRes, risksRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
          api.get("/risk-predictions"),
        ]);

        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
        setRisks(risksRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  const highRiskProjectIds = new Set(
    risks.filter((r) => r.risk_level === "High").map((r) => r.project_id)
  );

  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="dashboard-loading">
          <div className="spinner spinner-dark" />
          <p>Loading project workspace...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="dashboard-page">
        {error && <div className="alert alert-error">{error}</div>}

        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Project Command Center</p>
            <h1>AI Project Management Dashboard</h1>
            <p>
              Monitor projects, task progress, completion status, and delivery risks
              from one professional workspace.
            </p>
          </div>

          <div className="dashboard-hero-actions">
            <Link to="/projects" className="btn btn-secondary">
              Manage Projects
            </Link>
            <Link to="/ai-task-generator" className="btn btn-primary">
              Generate Tasks
            </Link>
          </div>
        </section>

        <section className="premium-kpi-grid">
          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-blue">
              <span>PR</span>
            </div>
            <div>
              <p>Total Projects</p>
              <h2>{projects.length}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-green">
              <span>TS</span>
            </div>
            <div>
              <p>Total Tasks</p>
              <h2>{tasks.length}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-amber">
              <span>DN</span>
            </div>
            <div>
              <p>Completed Tasks</p>
              <h2>{completedTasks}</h2>
            </div>
          </div>

          <div className="premium-kpi-card">
            <div className="kpi-icon kpi-red">
              <span>RK</span>
            </div>
            <div>
              <p>High Risk Projects</p>
              <h2>{highRiskProjectIds.size}</h2>
            </div>
          </div>
        </section>

        <section className="dashboard-insight-card">
          <div>
            <p className="eyebrow">Delivery Progress</p>
            <h2>{completionRate}% task completion rate</h2>
            <p>
              {tasks.length > 0
                ? `${completedTasks} out of ${tasks.length} tasks are currently completed.`
                : "No tasks available yet. Generate or create tasks to start tracking delivery progress."}
            </p>
          </div>

          <div className="progress-ring">
            <span>{completionRate}%</span>
          </div>
        </section>

        <div className="dashboard-grid-2">
          <section className="premium-card">
            <div className="premium-card-header">
              <div>
                <h2>Recent Projects</h2>
                <p>Your most recently created projects.</p>
              </div>

              <Link to="/projects" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="premium-empty-state compact-empty">
                <div className="empty-illustration">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>No projects yet</h3>
                <p>Create your first project to start managing delivery work.</p>
                <Link to="/projects" className="btn btn-primary btn-sm">
                  Create Project
                </Link>
              </div>
            ) : (
              <div className="premium-table-wrap">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Project Title</th>
                      <th>Status</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.title}</strong>
                        </td>
                        <td>
                          <Badge value={p.status} />
                        </td>
                        <td className="text-muted">{p.deadline || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="premium-card">
            <div className="premium-card-header">
              <div>
                <h2>Recent Tasks</h2>
                <p>Latest tasks across all active projects.</p>
              </div>

              <Link to="/tasks" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="premium-empty-state compact-empty">
                <div className="empty-illustration">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>No tasks yet</h3>
                <p>Use the AI Task Generator to create structured project tasks.</p>
                <Link to="/ai-task-generator" className="btn btn-primary btn-sm">
                  Generate Tasks
                </Link>
              </div>
            ) : (
              <div className="premium-table-wrap">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 5).map((t) => (
                      <tr key={t.id}>
                        <td>
                          <strong>{t.title}</strong>
                        </td>
                        <td>
                          <Badge value={t.priority} />
                        </td>
                        <td>
                          <Badge value={t.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}