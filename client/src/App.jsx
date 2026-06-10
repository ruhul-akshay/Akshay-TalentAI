import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import ProfilePage from "./pages/ProfilePage";
import CandidatesDatabasePage from "./pages/MasterData";
import ATSPage from "./pages/ATSPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import JobsPage from "./pages/JobsPage";
import InterviewPage from "./pages/InterviewPage";
import JobSeekerJobsPage from "./pages/JobSeekerJobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-300 mb-6">
              The application encountered an unexpected error. Don't worry, we
              can fix this!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              🔄 Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// App Content Component (inside AuthProvider)
function AppContent() {
  const { isAuthenticated, loading, user, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading ATS Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - Always accessible */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />
        }
      />

      {/* Protected routes - Require authentication */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              {user?.role === "admin" ? (
                <DashboardPage />
              ) : (
                <JobSeekerDashboard />
              )}
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/ats"
        element={
          isAuthenticated ? (
            <ProtectedRoute requiredRole="admin">
              <ATSPage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/analytics"
        element={
          isAuthenticated ? (
            <ProtectedRoute requiredRole="admin">
              <AnalyticsPage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/jobs"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              {user?.role === "admin" ? <JobsPage /> : <JobSeekerJobsPage />}
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/applications"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              {user?.role === "admin" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <JobSeekerDashboard initialSection="applications" />
              )}
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/candidates"
        element={
          isAuthenticated ? (
            <ProtectedRoute requiredRole="admin">
              <CandidatesPage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/interviews"
        element={
          isAuthenticated ? (
            <ProtectedRoute requiredRole="admin">
              <InterviewPage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/candidates-database"
        element={
          isAuthenticated ? (
            <ProtectedRoute requiredRole="admin">
              <CandidatesDatabasePage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Logout route */}
      <Route path="/logout" element={<LogoutHandler />} />

      {/* Catch all - redirect to appropriate page */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

// Logout Handler Component
function LogoutHandler() {
  const { logout } = useAuth();

  React.useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        // Navigation will be handled by the routing system
      } catch (error) {
        console.error("Logout error:", error);
        // Force logout even if API call fails
        window.location.href = "/login";
      }
    };

    handleLogout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Signing out...</p>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
