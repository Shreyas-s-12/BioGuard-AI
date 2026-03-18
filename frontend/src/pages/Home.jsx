import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function Home() {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated glow layers */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0">
            <div className="absolute" style={{ top: '-200px', left: '-200px', width: '600px', height: '600px' }}>
              <div className="w-full h-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent)', filter: 'blur(120px)' }}></div>
            </div>
            <div className="absolute" style={{ bottom: '-200px', right: '-200px', width: '600px', height: '600px' }}>
              <div className="w-full h-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent)', filter: 'blur(120px)' }}></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center space-y-8">
          {/* Premium Hero Section */}
          <div className="space-y-6">
            {/* Gradient Heading */}
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              NutriDetect AI
            </h1>
            
            {/* Subtext */}
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Advanced AI-powered food safety analysis that detects harmful additives, hidden sugars, and nutritional concerns in real-time.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {/* Primary Button - Gradient with glow */}
              <Link
                to="/analyze"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
              >
                Start Analysis
                <span className="text-base" aria-hidden="true">🚀</span>
              </Link>
              
              {/* Secondary Button - Outline glass */}
              <Link
                to="/chemicals"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-300 border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 hover:border-slate-600 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Explore Database
                <span className="text-base" aria-hidden="true">🔬</span>
              </Link>
            </div>
          </div>
          
          {/* Features Overview */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">🧪</span>
              </div>
              <h3 className="font-semibold text-slate-200">Chemical Analysis</h3>
              <p className="text-slate-400 text-sm">Detect 1000+ harmful additives</p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">🍯</span>
              </div>
              <h3 className="font-semibold text-slate-200">Sugar Detection</h3>
              <p className="text-slate-400 text-sm">Identify 100+ hidden sugar aliases</p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">⚡</span>
              </div>
              <h3 className="font-semibold text-slate-200">Lightning Fast</h3>
              <p className="text-slate-400 text-sm">Results in under 5 seconds</p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">🎯</span>
              </div>
              <h3 className="font-semibold text-slate-200">High Accuracy</h3>
              <p className="text-slate-400 text-sm">99% precision rate</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;

