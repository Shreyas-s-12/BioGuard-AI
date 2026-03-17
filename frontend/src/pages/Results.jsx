import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function RiskMeter({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const color =
    safeScore < 30 ? 'bg-green-500' : safeScore < 60 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between text-sm mb-2 text-slate-400">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
        <div
          className={`${color} h-4 transition-all duration-700`}
          style={{ width: `${safeScore}%` }}
        />
      </div>

      <p className="text-center mt-2 text-slate-300">Risk Score: {safeScore}%</p>
    </div>
  );
}

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Analysis Results</h2>
            <p className="text-slate-400 mb-8">
              You have not analyzed any nutrition facts yet. Start by pasting nutrition facts.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Go to Analysis
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    detected_factors = [],
    health_effects = [],
    analysis_summary = '',
    detected_chemicals = [],
    diseases = [],
    nutrition_issues = [],
    recommendation = '',
    original_ingredients = '',
    translated_ingredients = '',
    was_translated = false,
    food_safety_score = null
  } = results;

  const getRiskScore = () => {
    if (results.risk_score !== undefined && results.risk_score !== null) {
      return Math.max(0, Math.min(100, Number(results.risk_score) || 0));
    }
    if (health_effects.length > 5) return 80;
    if (health_effects.length > 2) return 60;
    if (health_effects.length > 0) return 40;
    return 20;
  };

  const getRiskLevel = () => {
    if (results.risk_level) return results.risk_level;
    const score = getRiskScore();
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  const finalScore = getRiskScore();
  const finalRiskLevel = getRiskLevel();
  const finalSafetyScore =
    typeof food_safety_score === 'number' ? food_safety_score : Math.max(0, 100 - finalScore);

  const displayFactors =
    detected_chemicals.length > 0 ? detected_chemicals.map((c) => c.chemical_name) : detected_factors;
  const displayDiseases = diseases.length > 0 ? diseases : health_effects;
  const displayNutritionIssues = Array.isArray(nutrition_issues) ? nutrition_issues : [];
  const displaySummary = recommendation || analysis_summary;

  const healthyAlternatives = [
    'Fresh Fruit Juice',
    'Coconut Water',
    'Homemade Lemon Juice',
    'Fresh Smoothie',
    'Natural Yogurt'
  ];

  const hiddenSugars = useMemo(() => {
    const sugarMarkers = [
      'sugar',
      'syrup',
      'fructose',
      'glucose',
      'dextrose',
      'maltose',
      'honey',
      'high fructose corn syrup',
      'aspartame',
      'sucralose',
      'saccharin',
      'acesulfame',
      'sweetener'
    ];

    const fromIngredients = (displayFactors || []).filter((item) => {
      const text = String(item || '').toLowerCase();
      return sugarMarkers.some((marker) => text.includes(marker));
    });

    const fromNutrition = displayNutritionIssues.filter((item) =>
      String(item || '').toLowerCase().includes('sugar')
    );

    return Array.from(new Set([...fromIngredients, ...fromNutrition]));
  }, [displayFactors, displayNutritionIssues]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm text-slate-400">Analysis Complete</span>
            </div>
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Analysis Results
              </span>
            </h1>
            <p className="text-slate-400 mt-1">Food safety and health risk assessment</p>
          </div>
          <button
            onClick={handleNewAnalysis}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </button>
        </div>

        {was_translated && translated_ingredients && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Translated Ingredients</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Original Input:</p>
                <p className="text-slate-300 text-sm bg-white/5 p-3 rounded-lg">{original_ingredients}</p>
              </div>
              <div>
                <p className="text-sm text-cyan-400 mb-1">Translated to English:</p>
                <p className="text-white text-sm bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">{translated_ingredients}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-cyan-400">Food Safety Score</h2>
              <p className="text-4xl font-bold mt-2 text-white">{finalSafetyScore}/100</p>
              <div className="text-sm text-slate-400 mt-1">
                Risk Level: <span className="text-slate-200">{finalRiskLevel}</span>
              </div>
              <RiskMeter score={finalScore} />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Health Concerns</h3>
              {displayDiseases.length > 0 ? (
                <ul className="space-y-2 text-slate-300">
                  {displayDiseases.map((effect, index) => (
                    <li key={index}>- {String(effect).replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No significant health concerns detected.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Detected Chemicals</h3>
              {displayFactors.length > 0 ? (
                <ul className="space-y-2 text-slate-300">
                  {displayFactors.map((item, index) => (
                    <li key={index}>- {String(item).replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No specific additives detected.</p>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Hidden Sugars</h3>
              {hiddenSugars.length > 0 ? (
                <ul className="space-y-2 text-slate-300">
                  {hiddenSugars.map((item, index) => (
                    <li key={index}>- {String(item).replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No hidden sugar indicators detected.</p>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Nutrition Issues</h3>
              {displayNutritionIssues.length > 0 ? (
                <ul className="space-y-2 text-slate-300">
                  {displayNutritionIssues.map((item, index) => (
                    <li key={index}>- {String(item).replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No major nutrition issues detected.</p>
              )}
            </div>
          </div>
        </div>

        {finalScore > 50 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-400 mb-3">Healthier Alternatives</h3>
            <ul className="space-y-2 text-slate-300">
              {healthyAlternatives.map((item, index) => (
                <li key={index}>- {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h2>
          <div className="bg-slate-800/30 rounded-xl p-5">
            <p className="text-slate-300 leading-relaxed">
              {displaySummary ||
                'The analysis has been completed. Please review the detected ingredients and health concerns above for more details.'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Results;
