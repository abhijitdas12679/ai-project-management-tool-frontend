import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api, { getErrorMessage } from "../api/api";

export default function MeetingNotes() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    project_id: "",
    raw_input: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResult(null);
    setGenerating(true);

    try {
      const res = await api.post("/ai/generate-meeting-notes", form);
      setResult(res.data);

      if (form.save) {
        setSuccess("Meeting notes generated and saved.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout title="Meeting Notes">
      <div className="meeting-notes-page">
        <section className="meeting-notes-hero">
          <div>
            <p className="eyebrow">AI Meeting Assistant</p>
            <h1>Convert discussions into professional MOM</h1>
            <p>
              Paste raw meeting notes, transcript points, or discussion summaries and
              generate structured minutes, decisions, action items, and next steps.
            </p>
          </div>

          <div className="hero-stat-card">
            <span>Status</span>
            <strong>{result ? "Ready" : "Draft"}</strong>
            <small>{result ? "MOM Generated" : "Awaiting Input"}</small>
          </div>
        </section>

        <div className="meeting-notes-grid">
          <section className="premium-card">
            <div className="premium-card-header">
              <div>
                <h2>Meeting Input</h2>
                <p>Provide meeting context so AI can prepare a structured MOM.</p>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-group">
                <label className="form-label">Link to Project</label>
                <select
                  className="form-select"
                  value={form.project_id}
                  onChange={(e) =>
                    setForm({ ...form, project_id: e.target.value })
                  }
                >
                  <option value="">None — generate standalone meeting notes</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Raw Meeting Discussion</label>
                <textarea
                  className="form-textarea meeting-input-textarea"
                  value={form.raw_input}
                  onChange={(e) =>
                    setForm({ ...form, raw_input: e.target.value })
                  }
                  placeholder="Paste meeting transcript, rough notes, discussion points, decisions, blockers, owners, and deadlines..."
                  required
                />
              </div>

              <label className="save-option" htmlFor="save-notes">
                <input
                  type="checkbox"
                  id="save-notes"
                  checked={form.save}
                  onChange={(e) =>
                    setForm({ ...form, save: e.target.checked })
                  }
                />
                <span>
                  <strong>Save meeting notes</strong>
                  <small>Store generated MOM in meeting notes history.</small>
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
                    Generating meeting notes...
                  </>
                ) : (
                  "Generate Meeting Notes"
                )}
              </button>
            </form>
          </section>

          <section className="premium-card meeting-output-card">
            <div className="premium-card-header">
              <div>
                <h2>Meeting Minutes</h2>
                <p>Structured summary, decisions, action items, and next steps.</p>
              </div>

              {result && <span className="task-count-badge">Generated</span>}
            </div>

            {generating ? (
              <div className="premium-loading">
                <div className="spinner spinner-dark" />
                <p>Structuring meeting discussion into professional MOM...</p>
              </div>
            ) : !result ? (
              <div className="premium-empty-state">
                <div className="empty-illustration">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>No meeting notes generated yet</h3>
                <p>
                  Add raw meeting discussion on the left and generate professional
                  meeting minutes here.
                </p>
              </div>
            ) : (
              <div className="meeting-result-list">
                <section className="meeting-result-block">
                  <div className="meeting-section-header">
                    <span>01</span>
                    <h3>Summary</h3>
                  </div>
                  <p>{result.summary}</p>
                </section>

                <section className="meeting-result-block">
                  <div className="meeting-section-header">
                    <span>02</span>
                    <h3>Key Discussion Points</h3>
                  </div>
                  <ul className="premium-list">
                    {result.key_discussion_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </section>

                <section className="meeting-result-block">
                  <div className="meeting-section-header">
                    <span>03</span>
                    <h3>Decisions Made</h3>
                  </div>
                  <ul className="premium-list">
                    {result.decisions_made.map((decision, index) => (
                      <li key={index}>{decision}</li>
                    ))}
                  </ul>
                </section>

                <section className="meeting-result-block">
                  <div className="meeting-section-header">
                    <span>04</span>
                    <h3>Action Items</h3>
                  </div>

                  <div className="premium-table-wrap">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Owner</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.action_items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{item.task}</strong>
                            </td>
                            <td>{item.owner}</td>
                            <td className="text-muted">{item.due_date || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="meeting-result-block">
                  <div className="meeting-section-header">
                    <span>05</span>
                    <h3>Next Steps</h3>
                  </div>
                  <ul className="premium-list">
                    {result.next_steps.map((step, index) => (
                      <li key={index}>{step}</li>
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