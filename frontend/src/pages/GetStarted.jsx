import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

export default function GetStarted() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#060d1f] text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="pointer-events-none fixed inset-0">
        {isDark && (
          <>
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
          </>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className={`rounded-[30px] border transition-colors duration-300 ${
          isDark 
            ? 'border-cyan-400/30 bg-slate-900/55 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.16)]'
            : 'border-slate-200 bg-white shadow-lg'
        }`}>
          <div className={`flex items-center justify-between border-b px-6 py-4 md:px-8 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-lg">🛡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                  BioGuard AI
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI-powered food safety analysis</p>
              </div>
            </div>
            <div className={`rounded-2xl border px-4 py-2 text-right ${
              isDark 
                ? 'border-cyan-400/30 bg-cyan-400/10' 
                : 'border-cyan-200 bg-cyan-50'
            }`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>1000+</div>
              <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Additives Detected</div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[240px_1fr] md:p-8">
            <aside className={`rounded-2xl border p-4 ${
              isDark 
                ? 'border-white/10 bg-white/5' 
                : 'border-slate-200 bg-slate-50'
            }`}>
              <nav className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className={`rounded-xl px-3 py-2 ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>HOME</div>
                <div className={`rounded-xl px-3 py-2 ${isDark ? '' : 'hover:bg-slate-100'}`}>ANALYZE</div>
                <div className={`rounded-xl px-3 py-2 ${isDark ? '' : 'hover:bg-slate-100'}`}>COMPARE</div>
                <div className={`rounded-xl px-3 py-2 ${isDark ? '' : 'hover:bg-slate-100'}`}>DATABASE</div>
                <div className={`rounded-xl px-3 py-2 ${isDark ? '' : 'hover:bg-slate-100'}`}>GUIDE</div>
                <div className={`rounded-xl px-3 py-2 ${isDark ? '' : 'hover:bg-slate-100'}`}>ABOUT</div>
              </nav>

              <div className={`mt-6 rounded-xl border p-3 ${
                isDark 
                  ? 'border-white/10 bg-slate-900/60' 
                  : 'border-slate-200 bg-white'
              }`}>
                <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Guest User</p>
                <Link
                  to="/login"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Login
                </Link>
              </div>
            </aside>

            <main className={`rounded-2xl border p-6 ${
              isDark 
                ? 'border-white/10 bg-slate-950/45' 
                : 'border-slate-200 bg-white'
            }`}>
              <div className={`mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                isDark 
                  ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300' 
                  : 'border-cyan-200 bg-cyan-50 text-cyan-700'
              }`}>
                AI-POWERED FOOD SAFETY ANALYSIS
              </div>

              <p className={`max-w-3xl md:text-lg ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Make informed choices about what you eat. Our AI platform analyzes food labels to detect harmful additives, hidden sugars, and nutrition concerns.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${
                  isDark 
                    ? 'border-white/10 bg-white/5' 
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>1000+</div>
                  <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Chemical Additives</div>
                </div>
                <div className={`rounded-2xl border p-4 ${
                  isDark 
                    ? 'border-white/10 bg-white/5' 
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>5s</div>
                  <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Analysis Time</div>
                </div>
                <div className={`rounded-2xl border p-4 ${
                  isDark 
                    ? 'border-white/10 bg-white/5' 
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>99%</div>
                  <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Accuracy Rate</div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #4F8CFF, #6AA8FF)',
                    boxShadow: '0 4px 12px rgba(79, 140, 255, 0.25)',
                    fontWeight: 600,
                    borderRadius: '12px',
                    padding: '16px 32px'
                  }}
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'white',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    color: isDark ? '#cbd5e1' : '#334155',
                    boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                    fontWeight: 600,
                    borderRadius: '12px',
                    padding: '16px 32px'
                  }}
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

