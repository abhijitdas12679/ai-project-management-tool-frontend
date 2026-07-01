import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Layout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const initials = (user?.full_name || user?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              ☰
            </button>

            <div className="topbar-heading">
              <span className="topbar-breadcrumb">Workspace</span>
              <h1 className="topbar-title">{title}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-date">
              <span>Today</span>
              <strong>{currentDate}</strong>
            </div>

            <div className="topbar-user">
              <div className="topbar-avatar">{initials}</div>

              <div className="topbar-user-info">
                <strong>{user?.full_name || "Demo User"}</strong>
                <span>{user?.role || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}