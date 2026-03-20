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

  // Personal care mode detection
  const isPersonalCare = location.pathname.startsWith('/personal-care');

  // Dynamic page title based on route
  const pageTitle = isPersonalCare ? "Personal Care Analysis 🧴" : "Food Safety Analysis 🍔";
  const titleColor = isPersonalCare ? "text-pink-400" : "text-cyan-400";

  // Dynamic active state styling based on mode
  const isActive = (path) => {
    const isActiveState = location.pathname === path;
    if (isActiveState) {
      return isPersonalCare
        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-l-4 border-purple-400"
        : "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-l-4 border-cyan-400";
    }
    return theme === 'dark' 
      ? "hover:bg-[#1F2937] hover:translate-x-1"
      : "hover:bg-slate-100 hover:translate-x-1";
  };

  // Use CSS variables for consistent theming
  const headerBg = theme === 'dark'
    ? "bg-[#0F172A]/80 border-[#374151]"
    : "bg-white/80 border-slate-200";

  const textSecondary = theme === 'dark' ? "text-[#9CA3AF]" : "text-slate-500";
  const textPrimary = theme === 'dark' ? "text-[#F9FAFB]" : "text-slate-700";
  
  // Personal care navigation links
  const personalCareLinks = [
    { path: "/personal-care", label: "Home", icon: "🏠" },
    { path: "/personal-care/analyze", label: "Analyze", icon: "🔬" },
    { path: "/personal-care/database", label: "Database", icon: "🧬" },
    { path: "/personal-care/guide", label: "Guide", icon: "📖" },
    { path: "/personal-care/about", label: "About", icon: "ℹ️" },
  ];

  // Food analysis navigation links
  const foodLinks = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/analyze", label: "Analyze", icon: "🧪" },
    { path: "/daily-tracker", label: "Tracker", icon: "📈" },
    { path: "/history", label: "History", icon: "🕘" },
    { path: "/chemicals", label: "Database", icon: "🧬" },
    { path: "/guide", label: "Guide", icon: "📘" },
    { path: "/about", label: "About", icon: "ℹ️" },
  ];

  // Use appropriate nav links based on current mode
  const navLinks = isPersonalCare ? personalCareLinks : foodLinks;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase sign out error:", error);
    }
    logout();
    navigate("/login");
  };

  // Get mode switch link
  const modeSwitchLink = isPersonalCare 
    ? { path: "/home", label: "🍎 Food Mode", icon: "🔄" }
    : { path: "/personal-care", label: "🧴 Personal Care", icon: "🔄" };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl ${headerBg} border-b transition-colors duration-300`}>
      <div className="max-w-[96rem] mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center justify-center hover:scale-105 transition duration-300">
            <div className={`p-[2px] rounded-xl bg-gradient-to-r ${isPersonalCare ? 'from-pink-500 to-purple-500' : 'from-cyan-500 to-purple-500'}`}>
              <div className="bg-slate-900 rounded-xl p-2 flex items-center justify-center">
                {!logoFailed ? (
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    src={logo}
                    alt="BioGuard Logo"
                    onError={() => setLogoFailed(true)}
                    className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                  />
                ) : (
                  <motion.span 
                    whileHover={{ scale: 1.1 }}
                    className="text-2xl" 
                    aria-hidden="true"
                  >🛡️</motion.span>
                )}
              </div>
            </div>
          </Link>
          {/* Dynamic Page Title */}
          <div className={`hidden md:flex text-sm ${titleColor} ml-2 font-medium`}>
            {pageTitle}
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
          {/* Mode Switch Button */}
          <Link
            to={modeSwitchLink.path}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
              isPersonalCare 
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
            }`}
          >
            <motion.span 
              whileHover={{ scale: 1.1 }}
              className="text-base" 
              aria-hidden="true"
            >
              {modeSwitchLink.icon}
            </motion.span>
            <span>{modeSwitchLink.label}</span>
          </Link>
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
            className={`hidden md:inline-flex px-3 py-2 text-sm bg-gradient-to-r ${isPersonalCare ? 'from-pink-500/10 to-purple-500/10 text-pink-500 border-pink-500/20' : 'from-cyan-500/10 to-purple-500/10 text-cyan-500 border-cyan-500/20'} rounded-full border`}
          >
            {isPersonalCare ? '🧴 100+ Chemicals' : '1000+ Additives'}
          </motion.span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
