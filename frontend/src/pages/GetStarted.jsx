import { Link } from "react-router-dom";

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-[#060d1f] text-white overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="rounded-[30px] border border-cyan-400/30 bg-slate-900/55 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.16)]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-lg">🛡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                  NutriDetect AI
                </h1>
                <p className="text-xs text-slate-400">AI-powered food safety analysis</p>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-right">
              <div className="text-2xl font-bold text-cyan-300">1000+</div>
              <div className="text-xs text-slate-300">Additives Detected</div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[240px_1fr] md:p-8">
            <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <nav className="space-y-2 text-sm text-slate-300">
                <div className="rounded-xl bg-cyan-500/20 px-3 py-2 text-cyan-300">HOME</div>
                <div className="rounded-xl px-3 py-2">ANALYZE</div>
                <div className="rounded-xl px-3 py-2">COMPARE</div>
                <div className="rounded-xl px-3 py-2">DATABASE</div>
                <div className="rounded-xl px-3 py-2">GUIDE</div>
                <div className="rounded-xl px-3 py-2">ABOUT</div>
              </nav>

              <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <p className="text-sm text-slate-200">Guest User</p>
                <Link
                  to="/login"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Login
                </Link>
              </div>
            </aside>

            <main className="rounded-2xl border border-white/10 bg-slate-950/45 p-6">
              <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                AI-POWERED FOOD SAFETY ANALYSIS
              </div>

              <p className="max-w-3xl text-slate-200 md:text-lg">
                Make informed choices about what you eat. Our AI platform analyzes food labels to detect harmful additives, hidden sugars, and nutrition concerns.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-bold text-cyan-300">1000+</div>
                  <div className="text-slate-300">Chemical Additives</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-bold text-cyan-300">5s</div>
                  <div className="text-slate-300">Analysis Time</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-bold text-cyan-300">99%</div>
                  <div className="text-slate-300">Accuracy Rate</div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_10px_35px_rgba(34,211,238,0.35)]"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white"
                >
                  Login
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

