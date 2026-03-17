import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path
      ? "text-nutri-primary bg-nutri-primary/10"
      : "text-slate-300 hover:text-white hover:bg-slate-800";
  };

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/analyze", label: "Analyze", icon: "🔬" },
    { path: "/history", label: "History", icon: "📋" },
    { path: "/chemicals", label: "Database", icon: "🧪" },
    { path: "/guide", label: "Guide", icon: "📖" },
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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LEFT SECTION - Logo + Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="NutriDetect AI"
              className="w-10 h-10 rounded-xl transition duration-300 hover:scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            />
          </Link>
          <div className="leading-tight">
            <h1 className="text-lg font-bold text-cyan-400">
              NutriDetect AI
            </h1>
          </div>
        </div>

        {/* CENTER NAVIGATION */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800/60 transition ${isActive(link.path)}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* RIGHT SECTION - User Info + Logout + Additives Badge */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-300">
              {user.name}
            </span>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-nutri-primary/20 text-nutri-primary hover:bg-nutri-primary/40 rounded-lg transition text-sm font-medium"
            >
              Login
            </Link>
          )}

          <span className="px-3 py-1.5 text-sm bg-cyan-500/20 text-cyan-400 rounded-full">
            🔬 1000+ Additives
          </span>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
