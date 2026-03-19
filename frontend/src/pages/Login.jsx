import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showGmailForm, setShowGmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleGmailLogin = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all fields");
      return;
    }

    login({
      name: name.trim(),
      email: email.trim(),
      method: "gmail",
    });

    navigate("/home");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative min-h-screen overflow-hidden px-4 transition-colors duration-300 ${
        isDark ? 'bg-[#050b1a]' : 'bg-slate-50'
      }`}
    >
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background effects - Dark mode only */}
      {isDark && (
        <>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" 
          />
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pointer-events-none absolute -bottom-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" 
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(236,72,153,0.14),transparent_35%)]" />
        </>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`w-full max-w-2xl rounded-3xl border p-8 shadow-lg md:p-12 transition-colors duration-300 ${
            isDark 
              ? 'border-white/15 bg-slate-900/55 shadow-[0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-2xl'
              : 'border-slate-200 bg-white'
          }`}
        >
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
              isDark 
                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' 
                : 'border-cyan-200 bg-cyan-50 text-cyan-600'
            }`}
          >
            AI Food Safety Platform
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`text-balance text-4xl font-semibold leading-tight md:text-5xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            NutriDetect AI
            <span className="block bg-gradient-to-r from-cyan-500 via-sky-500 to-fuchsia-500 bg-clip-text text-transparent">
              Smarter Labels. Safer Choices.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`mt-5 max-w-xl text-pretty text-base leading-relaxed md:text-lg ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Scan ingredients, uncover hidden additives, and get instant risk insights
            before a product reaches your cart.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className={`my-8 h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-white/25 to-transparent' : 'bg-slate-200'}`}
          />

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid gap-3 text-sm md:grid-cols-3"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl border px-3 py-2 transition-colors ${
                isDark 
                  ? 'border-white/10 bg-white/5 text-slate-200' 
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              Real-time label analysis
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl border px-3 py-2 transition-colors ${
                isDark 
                  ? 'border-white/10 bg-white/5 text-slate-200' 
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              Risk-based additive detection
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl border px-3 py-2 transition-colors ${
                isDark 
                  ? 'border-white/10 bg-white/5 text-slate-200' 
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              Personalized health warnings
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-8 space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login/google")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #4F8CFF, #6AA8FF)',
                boxShadow: '0 4px 12px rgba(79, 140, 255, 0.25)',
                fontWeight: 600,
                borderRadius: '12px'
              }}
            >
              Continue with Google
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowGmailForm((prev) => !prev)}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-colors"
              style={{
                background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                color: isDark ? '#cbd5e1' : '#334155'
              }}
            >
              {showGmailForm ? "Hide Gmail Login" : "Use Gmail Instead"}
            </motion.button>
          </motion.div>

          {showGmailForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-4 space-y-3 rounded-2xl border p-4 ${
                isDark 
                  ? 'border-white/15 bg-black/20' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <motion.input
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                placeholder="Your Name"
                className={`w-full rounded-xl border p-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-colors ${
                  isDark 
                    ? 'border-white/15 bg-slate-900/80 text-white' 
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <motion.input
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                type="email"
                placeholder="Gmail Address"
                className={`w-full rounded-xl border p-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-colors ${
                  isDark 
                    ? 'border-white/15 bg-slate-900/80 text-white' 
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <motion.input
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                type="password"
                placeholder="Password"
                className={`w-full rounded-xl border p-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-colors ${
                  isDark 
                    ? 'border-white/15 bg-slate-900/80 text-white' 
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGmailLogin}
                className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Sign In with Gmail
              </motion.button>
            </motion.div>
          )}

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className={`mt-4 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Secure sign-in with Google or Gmail
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
