import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="protected-loading">
        <div className="protected-loading-card">
          <div className="auth-logo-mark">AP</div>
          <div className="spinner spinner-dark" />
          <p>Preparing your workspace...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}