import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "DB" },
  { to: "/projects", label: "Projects", icon: "PR" },
  { to: "/tasks", label: "Tasks", icon: "TK" },
  { to: "/ai-task-generator", label: "AI Task Generator", icon: "AI" },
  { to: "/meeting-notes", label: "Meeting Notes", icon: "MN" },
  { to: "/risk-prediction", label: "Risk Prediction", icon: "RK" },
  { to: "/settings", label: "Settings", icon: "ST" },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const initials = (user?.full_name || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">AP</div>
        <span>AI PM Tool</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>

          <div>
            <div className="sidebar-user-name">{user?.full_name || "User"}</div>
            <div className="sidebar-user-role">{user?.role || "Member"}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Log Out
        </button>
      </div>
    </aside>
  );
}