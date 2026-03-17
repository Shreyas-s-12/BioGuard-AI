import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You might want to show a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-4 animate-pulse">
            <span className="text-white text-2xl">🛡</span>
          </div>
          <p className="text-cyan-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // No user found, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render children
  return children;
}
