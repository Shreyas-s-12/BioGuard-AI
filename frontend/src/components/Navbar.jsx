import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [logoFailed, setLogoFailed] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-l-4 border-cyan-400"
      : theme === 'dark' 
        ? "hover:bg-slate-800/60 hover:translate-x-1"
        : "hover:bg-slate-100 hover:translate-x-1";

  const headerBg = theme === 'dark'
    ? "bg-slate-900/60 border-slate-800"
    : "bg-white/80 border-slate-200";

  const textSecondary = theme === 'dark' ? "text-slate-400" : "text-slate-500";
  const textPrimary = theme === 'dark' ? "text-slate-300" : "text-slate-700";

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
    <header className={`sticky top-0 z-50 backdrop-blur-xl ${headerBg} border-b transition-colors duration-300`}>
      <div className="max-w-[96rem] mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-[190px]">
          <Link to="/home" className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-slate-800/80 border border-slate-700 hover:bg-slate-800/90' 
              : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
          }`}>
             {!logoFailed ? (
               <motion.img
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.95 }}
                 src={logo}
                 alt="NutriDetect AI"
                 onError={() => setLogoFailed(true)}
                 className="w-10 h-10 rounded-lg transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
               />
             ) : (
               <motion.span 
                 whileHover={{ scale: 1.1 }}
                 className="text-2xl" 
                 aria-hidden="true"
               >🛡️</motion.span>
             )}
           </Link>
          <div className="leading-tight">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              NutriDetect AI
            </h1>
            <p className={`text-xs ${textSecondary}`}>AI Food Safety</p>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-2 text-sm font-medium flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive(link.path)} ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="text-base" 
                aria-hidden="true"
              >
                {link.icon}
              </motion.span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 min-w-[210px] justify-end">
          <ThemeToggle />
          {user && <span className={`text-sm ${textPrimary} max-w-[110px] truncate`}>{user.name}</span>}

          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-3.5 py-2 text-sm bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/40 transition"
            >
              Logout
            </motion.button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-500 hover:from-cyan-500/30 hover:to-purple-500/30 rounded-xl transition text-sm font-medium border border-cyan-500/30"
            >
              Login
            </Link>
          )}

          <motion.span 
            whileHover={{ scale: 1.05 }}
            className={`hidden md:inline-flex px-3 py-2 text-sm bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-500 rounded-full border border-cyan-500/20`}
          >
            1000+ Additives
          </motion.span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
