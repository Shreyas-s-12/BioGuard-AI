import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-l-4 border-cyan-400"
      : "hover:bg-slate-800/60";

  const navLinks = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/analyze", label: "Analyze", icon: "🧪" },
    { path: "/daily-tracker", label: "Tracker", icon: "📈" },
    { path: "/history", label: "History", icon: "🕘" },
    { path: "/chemicals", label: "Database", icon: "🧬" },
    { path: "/guide", label: "Guide", icon: "📘" },
    { path: "/about", label: "About", icon: "ℹ️" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase sign out error:", error);
    }
    logout();
    navigate("/login");
  };

  return (
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/60 border-b border-slate-800">
    <div className="max-w-[96rem] mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-[190px]">
          <Link to="/home" className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800/90 transition-all duration-300">
             {!logoFailed ? (
               <img
                 src={logo}
                 alt="NutriDetect AI"
                 onError={() => setLogoFailed(true)}
                 className="w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
               />
             ) : (
               <span className="text-2xl" aria-hidden="true">🛡️</span>
             )}
           </Link>
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-cyan-400">NutriDetect AI</h1>
            <p className="text-xs text-slate-400">AI Food Safety</p>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-2 text-sm font-medium flex-1 justify-center">
          {navLinks.map((link) => (
             <Link
               key={link.path}
               to={link.path}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-800/60 transition-all duration-300 ${isActive(link.path)}`}
             >
               <span className="text-base" aria-hidden="true">{link.icon}</span>
               <span>{link.label}</span>
             </Link>
           ))}
        </nav>

        <div className="flex items-center gap-3 min-w-[210px] justify-end">
          {user && <span className="text-sm text-slate-300 max-w-[110px] truncate">{user.name}</span>}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 text-sm bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/40 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-nutri-primary/20 text-nutri-primary hover:bg-nutri-primary/40 rounded-xl transition text-sm font-medium"
            >
              Login
            </Link>
          )}

          <span className="hidden md:inline-flex px-3 py-2 text-sm bg-cyan-500/20 text-cyan-400 rounded-full">
            1000+ Additives
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
