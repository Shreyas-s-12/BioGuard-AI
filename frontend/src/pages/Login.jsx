import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

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
    <div className="relative min-h-screen overflow-hidden bg-[#050b1a] px-4">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(236,72,153,0.14),transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-12">
          <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            AI Food Safety Platform
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
            NutriDetect AI
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
              Smarter Labels. Safer Choices.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg">
            Scan ingredients, uncover hidden additives, and get instant risk insights
            before a product reaches your cart.
          </p>

          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Real-time label analysis</div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Risk-based additive detection</div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Personalized health warnings</div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/login/google")}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.45)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(14,165,233,0.6)]"
            >
              Continue with Google
              <span className="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
            </button>

            <button
              onClick={() => setShowGmailForm((prev) => !prev)}
              className="w-full rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              {showGmailForm ? "Hide Gmail Login" : "Use Gmail Instead"}
            </button>
          </div>

          {showGmailForm && (
            <div className="mt-4 space-y-3 rounded-2xl border border-white/15 bg-black/20 p-4">
              <input
                placeholder="Your Name"
                className="w-full rounded-xl border border-white/15 bg-slate-900/80 p-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Gmail Address"
                className="w-full rounded-xl border border-white/15 bg-slate-900/80 p-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-xl border border-white/15 bg-slate-900/80 p-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={handleGmailLogin}
                className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Sign In with Gmail
              </button>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-slate-400">
            Secure sign-in with Google or Gmail
          </p>
        </div>
      </div>
    </div>
  );
}
