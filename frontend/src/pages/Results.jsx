import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get results from sessionStorage
    const storedResults = sessionStorage.getItem('analysisResults');
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (err) {
        console.error('Failed to parse results:', err);
      }
    }
    
    setLoading(false);
  }, []);

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('analysisResults');
    navigate('/analyze');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="spinner w-12 h-12"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="glass rounded-2xl p-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-4">No Analysis Results</h2>
            <p className="text-slate-400 mb-8">
              You haven't analyzed any nutrition facts yet. Start by pasting nutrition facts.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nutri-primary to-nutri-secondary text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              Go to Analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { 
    detected_factors = [],
    possible_long_term_health_effects = [],
    analysis_summary = ''
  } = results;

  // Get factor badge class based on factor type
  const getFactorBadgeClass = (factor) => {
    const factorLower = factor.toLowerCase();
    
    const sweetenerFactors = ['aspartame', 'sucralose', 'saccharin', 'acesulfame potassium', 'stevia', 
                             'sugar alcohols', 'sorbitol', 'maltitol', 'xylitol', 'high fructose corn syrup'];
    const preservativeFactors = ['sodium benzoate', 'potassium benzoate', 'sodium nitrite', 'sodium nitrate',
                               'BHA', 'BHT', 'TBHQ', 'sodium metabisulfite', 'sulfur dioxide', 'parabens'];
    const additiveFactors = ['monosodium glutamate', 'phosphoric acid', 'carrageenan', 'artificial colors',
                          'titanium dioxide', 'artificial flavor', 'natural flavor', 'modified food starch', 
                          'hydrogenated oil'];
    const nutrientFactors = ['sodium', 'sugar', 'fat', 'caffeine'];
    
    if (sweetenerFactors.includes(factorLower)) {
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    } else if (preservativeFactors.includes(factorLower)) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    } else if (additiveFactors.includes(factorLower)) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    } else if (nutrientFactors.includes(factorLower)) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Analysis Results</span>
            </h1>
            <p className="text-slate-400">
              Food safety & health risk assessment
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleNewAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-nutri-primary to-nutri-secondary text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center"
            >
              <span>New Analysis</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Detected Factors */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-nutri-primary/20 rounded-lg flex items-center justify-center mr-2">
              🔬
            </span>
            Detected Factors
          </h2>
          
          {detected_factors && detected_factors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detected_factors.map((factor, index) => (
                <span
                  key={index}
                  className={`px-3 py-1.5 rounded-full border ${getFactorBadgeClass(factor)} capitalize`}
                >
                  {factor.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No specific factors detected.</p>
          )}
        </div>

        {/* Possible Long-Term Health Effects */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-2">
              ⚠️
            </span>
            Possible Long-Term Health Effects
          </h2>
          
          {possible_long_term_health_effects && possible_long_term_health_effects.length > 0 ? (
            <div className="space-y-3">
              {possible_long_term_health_effects.map((effect, index) => (
                <div 
                  key={index}
                  className="flex items-start p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <span className="text-red-400 mr-3">•</span>
                  <span className="text-slate-200 capitalize">{effect.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-green-400 mr-3">✅</span>
              <span className="text-green-300">No significant long-term health effects detected</span>
            </div>
          )}
        </div>

        {/* Analysis Summary */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-nutri-accent/20 rounded-lg flex items-center justify-center mr-2">
              📋
            </span>
            Analysis Summary
          </h2>
          
          <div className="bg-slate-800/30 rounded-lg p-6">
            <p className="text-slate-300 leading-relaxed text-lg">
              {analysis_summary || 'No analysis summary available.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Results;
