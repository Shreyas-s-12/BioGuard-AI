import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RiskMeter from '../components/RiskMeter';
import RiskBadge from '../components/RiskBadge';

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
              You haven't analyzed any nutrition facts yet. Start by pasting nutrition facts.
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
    risk_score = 50,
    // New format fields
    risk_level = '',
    detected_chemicals = [],
    diseases = [],
    nutrition_issues = [],
    recommendation = '',
    // Translation fields
    original_ingredients = '',
    translated_ingredients = '',
    was_translated = false,
    // NEW FIELDS FOR ADVANCED FEATURES
    processing_level = '',
    health_warnings = [],
    additive_interactions = [],
    ingredient_explanations = [],
    health_condition = ''
  } = results;

  // Handle both old and new format
  const getRiskScore = () => {
    // New format has direct risk_score
    if (results.risk_score !== undefined) return results.risk_score;
    // Old format - calculate from health effects
    if (health_effects.length > 5) return 80;
    if (health_effects.length > 2) return 60;
    if (health_effects.length > 0) return 40;
    return 20;
  };

  const getRiskLevel = () => {
    // New format has direct risk_level
    if (results.risk_level) return results.risk_level;
    // Old format - derive from score
    const score = getRiskScore();
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  const finalScore = getRiskScore();
  const finalRiskLevel = getRiskLevel();
  
  // Use new format data if available, otherwise fall back to old
  const displayFactors = detected_chemicals.length > 0 
    ? detected_chemicals.map(c => c.chemical_name) 
    : detected_factors;
  const displayDiseases = diseases.length > 0 ? diseases : health_effects;
  const displaySummary = recommendation || analysis_summary;

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
    
    if (sweetenerFactors.some(f => factorLower.includes(f))) {
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    } else if (preservativeFactors.some(f => factorLower.includes(f))) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    } else if (additiveFactors.some(f => factorLower.includes(f))) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    } else if (nutrientFactors.some(f => factorLower.includes(f))) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
            <p className="text-slate-400 mt-1">Food safety & health risk assessment</p>
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

        {/* Translation Info - Show when ingredients were translated */}
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

        {/* Risk Score Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <h2 className="text-xl font-semibold text-white mb-6">Overall Safety Summary</h2>
              <RiskMeter score={finalScore} />
            </div>
            <div className="flex-1">
              <div className={`p-6 rounded-2xl border ${
                finalScore >= 70 
                  ? 'bg-red-500/10 border-red-500/20' 
                  : finalScore >= 40 
                  ? 'bg-yellow-500/10 border-yellow-500/20'
                  : 'bg-green-500/10 border-green-500/20'
              }`}>
                <div className={`text-2xl font-bold mb-2 ${
                  finalScore >= 70 
                    ? 'text-red-400' 
                    : finalScore >= 40 
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}>
                  {finalRiskLevel} Risk
                </div>
                <p className="text-slate-400 text-sm">
                  {displaySummary || 'Based on the detected ingredients and nutritional values, this food product shows the following risk profile.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Detected Factors */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Detected Ingredients
            </h2>
            
            {displayFactors && displayFactors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayFactors.map((factor, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full border text-sm ${getFactorBadgeClass(typeof factor === 'string' ? factor : factor.chemical_name)} capitalize`}
                  >
                    {typeof factor === 'string' ? factor.replace(/_/g, ' ') : factor.chemical_name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No specific factors detected.</p>
            )}
          </div>

          {/* Health Effects */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              Health Concerns
            </h2>
            
            {displayDiseases && displayDiseases.length > 0 ? (
              <div className="space-y-2">
                {displayDiseases.map((effect, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <span className="text-red-400 mr-2">•</span>
                    <span className="text-slate-200 capitalize text-sm">{typeof effect === 'string' ? effect.replace(/_/g, ' ') : effect}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-300 text-sm">No significant health concerns detected</span>
              </div>
            )}
          </div>
        </div>

        {/* NEW: Health Warnings - Feature 3 */}
        {health_warnings && health_warnings.length > 0 && (
          <div className="mt-6 bg-orange-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-orange-400 mb-4 flex items-center">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              Health Condition Warnings
              {health_condition && (
                <span className="ml-2 text-sm text-orange-300">
                  (for {health_condition.replace('_', ' ')} patients)
                </span>
              )}
            </h2>
            
            <div className="space-y-2">
              {health_warnings.map((warning, index) => (
                <div 
                  key={index}
                  className="flex items-start p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
                >
                  <svg className="w-5 h-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-orange-200">{warning.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW: Processing Level - Feature 4 */}
        {processing_level && (
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              Processing Level (NOVA Classification)
            </h2>
            
            <div className="flex items-center">
              <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                processing_level === 'Ultra Processed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                processing_level === 'Processed' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                processing_level === 'Minimally Processed' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-green-500/20 text-green-400 border-green-500/30'
              }`}>
                {processing_level}
              </span>
              <span className="ml-4 text-slate-400 text-sm">
                {processing_level === 'Ultra Processed' && 'Highly processed with many additives and industrial formulations'}
                {processing_level === 'Processed' && 'Processed with added sugars, oils, salts, or other substances'}
                {processing_level === 'Minimally Processed' && 'Simple foods with minimal processing'}
                {processing_level === 'Whole Food' && 'Natural, unprocessed foods'}
              </span>
            </div>
          </div>
        )}

        {/* NEW: Additive Interactions - Feature 5 */}
        {additive_interactions && additive_interactions.length > 0 && (
          <div className="mt-6 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              Additive Interaction Warnings
            </h2>
            
            <div className="space-y-3">
              {additive_interactions.map((interaction, index) => (
                <div 
                  key={index}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-red-300 font-medium">
                      {interaction.ingredients?.join(' + ')}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                      interaction.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                      interaction.severity === 'moderate' ? 'bg-orange-500/30 text-orange-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {interaction.severity}
                    </span>
                  </div>
                  <p className="text-red-200 text-sm">{interaction.warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW: Ingredient Explanations - Feature 1 */}
        {ingredient_explanations && ingredient_explanations.length > 0 && (
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              AI Ingredient Explanations
            </h2>
            
            <div className="space-y-4">
              {detected_chemicals.slice(0, 5).map((chemical, index) => (
                <div 
                  key={index}
                  className="p-4 bg-slate-800/50 border border-white/10 rounded-xl"
                >
                  {chemical.explanation && (
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                      {chemical.explanation}
                    </pre>
                  )}
                </div>
              ))}
              {detected_chemicals.length > 5 && (
                <p className="text-slate-400 text-sm text-center">
                  + {detected_chemicals.length - 5} more chemicals detected
                </p>
              )}
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Detailed Analysis
          </h2>
          
          <div className="bg-slate-800/30 rounded-xl p-5">
            <p className="text-slate-300 leading-relaxed">
              {displaySummary || 'The analysis has been completed. Please review the detected ingredients and health concerns above for more details. This product has been evaluated based on nutritional values and ingredient safety profiles.'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Results;
