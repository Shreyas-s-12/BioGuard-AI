import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MealPlanner from '../components/MealPlanner';
import ExposureScore, { saveFoodRisk } from '../components/ExposureScore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const SUGAR_HYDRATION_KEY = 'sugar_hydration_tracker';

function RiskMeter({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number.isNaN(score) ? 0 : Number(score) || 0));
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
  const [dailySugarHydration, setDailySugarHydration] = useState({
    date: new Date().toISOString().slice(0, 10),
    sugar_counter: 0,
    hydration_level: 'Good'
  });

  useEffect(() => {
    const storedResults = sessionStorage.getItem('analysisResults');

    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        
        // Save risks to localStorage for daily exposure tracking
        if (parsedResults && parsedResults.chemicals) {
          parsedResults.chemicals.forEach((chemical) => {
            const riskLevel = String(chemical.risk_level || '').toLowerCase().trim();
            let score = 1; // Low default
            if (riskLevel === 'moderate') score = 2;
            else if (riskLevel === 'high') score = 3;
            
            saveFoodRisk({
              name: chemical.chemical_name || chemical.name || 'Unknown',
              riskLevel: riskLevel,
              score: score,
              productName: parsedResults.product_name || 'Unknown Product'
            });
          });
        }
      } catch (err) {
        console.error('Failed to parse results:', err);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let tracker = {
      date: today,
      sugar_counter: 0,
      hydration_level: 'Good'
    };

    try {
      const parsed = JSON.parse(localStorage.getItem(SUGAR_HYDRATION_KEY) || '{}');
      if (parsed && parsed.date === today && Number.isFinite(Number(parsed.sugar_counter))) {
        const sugarCounter = Math.max(0, Math.round(Number(parsed.sugar_counter)));
        tracker = {
          date: today,
          sugar_counter: sugarCounter,
          hydration_level: sugarCounter > 0 ? 'Low' : 'Good'
        };
      }
    } catch (_err) {
      tracker = { date: today, sugar_counter: 0, hydration_level: 'Good' };
    }

    localStorage.setItem(SUGAR_HYDRATION_KEY, JSON.stringify(tracker));
    setDailySugarHydration(tracker);
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

  const data = results && typeof results === 'object' ? results : null;
  if (!data) {
    return (
      <Layout>
        <div className="text-center text-slate-300 py-20">No data</div>
      </Layout>
    );
  }

  const safeResults = data;
  const detected_factors = Array.isArray(safeResults.detected_factors) ? safeResults.detected_factors : [];
  const health_effects = Array.isArray(safeResults.health_effects) ? safeResults.health_effects : [];
  const analysis_summary = typeof safeResults.analysis_summary === 'string' ? safeResults.analysis_summary : '';
  const detected_chemicals = Array.isArray(safeResults.detected_chemicals) ? safeResults.detected_chemicals : [];
  const hidden_ingredients = Array.isArray(safeResults.hidden_ingredients) ? safeResults.hidden_ingredients : [];
  const toxicityTimeline = Array.isArray(safeResults.timeline)
    ? safeResults.timeline
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const diseases = Array.isArray(safeResults.diseases) ? safeResults.diseases : [];
  const nutrition_issues = Array.isArray(safeResults.nutrition_issues) ? safeResults.nutrition_issues : [];
  const recommendation = typeof safeResults.recommendation === 'string' ? safeResults.recommendation : '';
  const original_ingredients = typeof safeResults.original_ingredients === 'string' ? safeResults.original_ingredients : '';
  const translated_ingredients = typeof safeResults.translated_ingredients === 'string' ? safeResults.translated_ingredients : '';
  const was_translated = Boolean(safeResults.was_translated);
  const food_safety_score =
    typeof safeResults.food_safety_score === 'number' ? safeResults.food_safety_score :
    (typeof safeResults.food_safety_score === 'string' ? parseInt(safeResults.food_safety_score, 10) : null);
  const complexity_score = Math.max(
    0,
    Math.min(
      100,
      typeof safeResults.complexity_score === 'number'
        ? safeResults.complexity_score
        : Number(safeResults.complexity_score) || 0
      )
  );
  const food_score = Math.max(
    0,
    Math.min(
      100,
      typeof safeResults.food_score === 'number'
        ? safeResults.food_score
        : Number(safeResults.food_score) || 0
    )
  );
  const confidence = Math.max(
    0,
    Math.min(
      100,
      typeof safeResults.confidence === 'number'
        ? safeResults.confidence
        : Number(safeResults.confidence) || 0
    )
  );
  const decision = typeof safeResults.decision === 'string' && safeResults.decision.trim()
    ? safeResults.decision.trim()
    : 'Safe to eat';
  const impact = typeof safeResults.impact === 'string' && safeResults.impact.trim()
    ? safeResults.impact.trim()
    : 'No data available';
  const recommendations = Array.isArray(safeResults.recommendations)
    ? safeResults.recommendations.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];
  const recommendedMeals = Array.isArray(safeResults.recommended_meals) && safeResults.recommended_meals.length > 0
    ? safeResults.recommended_meals
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : ['Oats with fruits', 'Grilled paneer', 'Salad bowl'];
  const deficiencies = Array.isArray(safeResults.deficiencies)
    ? safeResults.deficiencies.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];
  const pairingSuggestions = Array.isArray(safeResults.pairing_suggestions)
    ? safeResults.pairing_suggestions.filter((item) => item && typeof item === 'object' && item.item && item.suggestion)
        .map((item) => ({
          item: String(item.item || '').trim(),
          suggestion: String(item.suggestion || '').trim()
        }))
    : [];
  const category = typeof safeResults.category === 'string' && safeResults.category.trim()
    ? safeResults.category.trim()
    : 'Healthy';
  const simplified = typeof safeResults.simplified === 'string' && safeResults.simplified.trim()
    ? safeResults.simplified.trim()
    : 'No data available';
  const simplifiedSummary = typeof safeResults.simplified_summary === 'string' && safeResults.simplified_summary.trim()
    ? safeResults.simplified_summary.trim()
    : simplified;
  const grocerySummary = safeResults.grocery_summary && typeof safeResults.grocery_summary === 'object'
    ? {
        total_items: Math.max(0, Number(safeResults.grocery_summary.total_items) || 0),
        high_risk_count: Math.max(0, Number(safeResults.grocery_summary.high_risk_count) || 0),
        safe_items: Array.isArray(safeResults.grocery_summary.safe_items)
          ? safeResults.grocery_summary.safe_items.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
          : [],
        overall_grocery_score: Math.max(0, Math.min(100, Number(safeResults.grocery_summary.overall_grocery_score) || 0))
      }
    : null;

  const getRiskScore = () => {
    if (safeResults.risk_score !== undefined && safeResults.risk_score !== null) {
      return Math.max(0, Math.min(100, Number(safeResults.risk_score) || 0));
    }
    if (health_effects.length > 5) return 80;
    if (health_effects.length > 2) return 60;
    if (health_effects.length > 0) return 40;
    return 20;
  };

  const getRiskLevel = () => {
    if (typeof safeResults.risk_level === 'string' && safeResults.risk_level.trim()) {
      return safeResults.risk_level;
    }
    const score = getRiskScore();
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  const finalScore = getRiskScore();
  const finalRiskLevel = getRiskLevel();
  const backendSummary =
    typeof safeResults.summary === 'string' ? safeResults.summary.trim() : '';
  const topSummary = simplifiedSummary || backendSummary || 'No data available';
  const finalSafetyScore =
    typeof food_safety_score === 'number' && !isNaN(food_safety_score) 
      ? Math.max(0, Math.min(100, food_safety_score)) 
      : Math.max(0, 100 - finalScore);
  const complexityBarColor =
    complexity_score >= 70 ? 'bg-red-500' : complexity_score >= 40 ? 'bg-yellow-400' : 'bg-green-500';
  const decisionBadgeClass =
    decision.toLowerCase().includes('avoid')
      ? 'bg-red-500/20 text-red-300 border-red-500/30'
      : decision.toLowerCase().includes('occasion')
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        : 'bg-green-500/20 text-green-300 border-green-500/30';
  const categoryBadgeClass =
    category.toLowerCase() === 'junk'
      ? 'bg-red-500/20 text-red-300 border-red-500/30'
      : category.toLowerCase() === 'processed'
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        : 'bg-green-500/20 text-green-300 border-green-500/30';

  const getRiskTextColorClass = (riskLevel) => {
    const normalized = String(riskLevel || '').toLowerCase().trim();
    if (normalized === 'high') return 'text-red-400';
    if (normalized === 'moderate') return 'text-yellow-400';
    if (normalized === 'low') return 'text-green-400';
    return 'text-slate-300';
  };

  const displayChemicalsWithRisk = detected_chemicals.length > 0
    ? detected_chemicals
        .map((chemical) => {
          if (chemical && typeof chemical === 'object') {
            return {
              name: String(chemical.chemical_name || '').trim(),
              riskLevel: String(chemical.risk_level || '').trim()
            };
          }
          return {
            name: String(chemical || '').trim(),
            riskLevel: ''
          };
        })
        .filter((item) => item.name)
    : (Array.isArray(detected_factors) ? detected_factors : [])
        .map((factor) => ({
          name: String(factor || '').trim(),
          riskLevel: ''
        }))
        .filter((item) => item.name);

  const displayFactors = displayChemicalsWithRisk.map((item) => item.name);
  const displayDiseases = diseases.length > 0 ? diseases : health_effects;
  const displayNutritionIssues = Array.isArray(nutrition_issues) ? nutrition_issues : [];
  const displaySummary = topSummary || recommendation || analysis_summary || 'No data available';
  const displayHiddenIngredients = hidden_ingredients
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      original: String(item.original || '').trim(),
      actual: String(item.actual || '').trim()
    }))
    .filter((item) => item.original && item.actual);

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

  const hiddenSugars = Array.from(new Set([...fromIngredients, ...fromNutrition]));
  const historyTrendData = (() => {
    let parsedHistory = [];
    try {
      const rawHistory = localStorage.getItem('history');
      const parsed = JSON.parse(rawHistory || '[]');
      parsedHistory = Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      parsedHistory = [];
    }

    const points = parsedHistory
      .map((item) => {
        const rawDate = item?.date || item?.timestamp;
        const riskScore = Number(item?.risk_score);
        if (!rawDate || Number.isNaN(riskScore)) return null;
        const dateObj = new Date(rawDate);
        if (Number.isNaN(dateObj.getTime())) return null;
        return {
          time: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          risk_score: Math.max(0, Math.min(100, riskScore)),
          ts: dateObj.getTime()
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts)
      .slice(-20)
      .map(({ time, risk_score }) => ({ time, risk_score }));

    return points;
  })();
  const historyStats = (() => {
    let parsedHistory = [];

    try {
      const rawHistory = localStorage.getItem('history');
      const parsed = JSON.parse(rawHistory || '[]');
      parsedHistory = Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      parsedHistory = [];
    }

    const high_risk_count = parsedHistory.reduce((count, item) => {
      const riskLevel = String(item?.risk_level || '').toLowerCase().trim();
      const riskScore = Number(item?.risk_score);
      const isHighRisk = riskLevel === 'high' || (!Number.isNaN(riskScore) && riskScore > 70);
      return isHighRisk ? count + 1 : count;
    }, 0);

    const moderate_count = parsedHistory.reduce((count, item) => {
      const riskLevel = String(item?.risk_level || '').toLowerCase().trim();
      const riskScore = Number(item?.risk_score);
      const isModerateByLevel = riskLevel === 'moderate';
      const isModerateByScore =
        !Number.isNaN(riskScore) && riskScore > 40 && riskScore <= 70;
      return isModerateByLevel || isModerateByScore ? count + 1 : count;
    }, 0);

    let insight = '';
    if (high_risk_count > 5) {
      insight = 'User frequently consumes high-risk food';
    } else if (moderate_count > 5) {
      insight = 'User often consumes moderate-risk food';
    } else if (parsedHistory.length > 0) {
      insight = 'No strong high-risk pattern detected in recent history.';
    } else {
      insight = 'No history data yet.';
    }

    return {
      hasHistory: parsedHistory.length > 0,
      high_risk_count,
      moderate_count,
      insight
    };
  })();

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

        {/* Daily Exposure Score */}
        <div className="mb-8">
          <ExposureScore showFullDetails={true} />
        </div>

        <div className="dark:bg-cyan-500/10 dark:border-cyan-500/30 bg-cyan-50 border-cyan-200 rounded-xl p-4 mb-8">
          <p className="dark:text-cyan-100 text-cyan-900 font-medium">{topSummary}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Food Score</p>
            <p className="text-3xl font-bold text-white">{food_score}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-2">Decision</p>
            <span className={`inline-flex px-4 py-2 rounded-full border text-base font-semibold ${decisionBadgeClass}`}>
              {decision}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Confidence Score</p>
            <p className="text-2xl font-bold text-cyan-300">{confidence}%</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-2">Category</p>
            <span className={`inline-flex px-3 py-1 rounded-full border text-sm font-medium ${categoryBadgeClass}`}>
              {category}
            </span>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 mb-8">
          <h3 className="text-lg font-semibold text-indigo-200 mb-2">Daily Sugar & Hydration Impact</h3>
          <p className="text-slate-200">Today's Sugar Intake: {dailySugarHydration.sugar_counter}g</p>
          <p className={`${dailySugarHydration.hydration_level === 'Low' ? 'text-amber-300' : 'text-emerald-300'}`}>
            Hydration Level: {dailySugarHydration.hydration_level}
          </p>
        </div>

        {grocerySummary && (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-teal-200 mb-2">Grocery Health Score</h3>
            <div className="grid md:grid-cols-4 gap-4 text-slate-200">
              <div>
                <p className="text-xs text-slate-400">Overall Score</p>
                <p className="text-2xl font-bold text-teal-300">{grocerySummary.overall_grocery_score}/100</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Items</p>
                <p className="text-xl font-semibold">{grocerySummary.total_items}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">High-Risk Items</p>
                <p className="text-xl font-semibold text-red-300">{grocerySummary.high_risk_count}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Safe Items</p>
                <p className="text-xl font-semibold text-green-300">{grocerySummary.safe_items.length}</p>
              </div>
            </div>
            {grocerySummary.safe_items.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-slate-300 mb-2">Safer picks:</p>
                <ul className="space-y-1 text-slate-200">
                  {grocerySummary.safe_items.slice(0, 8).map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-indigo-300 mb-4">History Insights</h3>
          {historyStats.hasHistory ? (
            <div className="space-y-2 text-slate-200">
              <p>
                High Risk Count: <span className="text-red-400 font-semibold">{historyStats.high_risk_count}</span>
              </p>
              <p>
                Moderate Count: <span className="text-yellow-400 font-semibold">{historyStats.moderate_count}</span>
              </p>
              <p className="text-cyan-200">{historyStats.insight}</p>
            </div>
          ) : (
            <p className="text-slate-400">No history data yet.</p>
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Risk Trend Graph</h3>
          {historyTrendData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '10px',
                      color: '#e2e8f0'
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="risk_score"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 0, fill: '#22d3ee' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400">No history data to plot.</p>
          )}
        </div>

        {toxicityTimeline.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-cyan-300 mb-5">Toxicity Timeline</h3>
            <div className="relative pl-8">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-cyan-500/30" />
              {toxicityTimeline.map((item, index) => (
                <div key={index} className="relative mb-5 last:mb-0">
                  <span
                    className={`absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border border-slate-900 ${
                      index === toxicityTimeline.length - 1 ? 'bg-red-400' : index === 1 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                  />
                  <p className="text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-8">
          <h3 className="text-lg font-semibold dark:text-red-300 text-red-800 mb-2">Health Impact</h3>
          <p className="dark:text-red-100 text-red-700">{impact}</p>
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
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Processing Complexity</h3>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`${complexityBarColor} h-3 transition-all duration-700`}
                  style={{ width: `${complexity_score}%` }}
                />
              </div>
              <p className="text-slate-300 mt-3">Complexity Score: {complexity_score}/100</p>
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
              {displayChemicalsWithRisk.length > 0 ? (
                <ul className="space-y-2">
                  {displayChemicalsWithRisk.map((item, index) => (
                    <li key={index}>
                      -{' '}
                      <span className={getRiskTextColorClass(item.riskLevel)}>
                        {String(item.name).replace(/_/g, ' ')}
                      </span>
                    </li>
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
              <h3 className="text-lg font-semibold text-pink-400 mb-3">Hidden Ingredients Detected</h3>
              {displayHiddenIngredients.length > 0 ? (
                <ul className="space-y-2 text-slate-300">
                  {displayHiddenIngredients.map((item, index) => (
                    <li key={index}>
                      - {item.original} {'->'} {item.actual}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No hidden ingredient aliases detected.</p>
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

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-green-400 mb-3">Recommendations</h3>
          {recommendations.length > 0 ? (
            <ul className="space-y-2 text-slate-300">
              {recommendations.map((item, index) => (
                <li key={index}>- {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">No data available</p>
          )}
        </div>

        {pairingSuggestions.length > 0 && (
          <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-violet-300 mb-3">Healthier Pairing Suggestions</h3>
            <ul className="space-y-3">
              {pairingSuggestions.map((pair, index) => (
                <li key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-red-300 font-medium">- {pair.item}</span>
                  <span className="text-slate-400 hidden sm:inline">→</span>
                  <span className="text-green-300">{pair.suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-3">Recommended Meals</h3>
          {recommendedMeals.length > 0 ? (
            <ul className="space-y-2 text-slate-300">
              {recommendedMeals.map((item, index) => (
                <li key={index}>- {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">No data available</p>
          )}
        </div>

        <MealPlanner />

        {deficiencies.length > 0 && (
          <div className="dark:bg-amber-500/10 dark:border-amber-500/30 bg-amber-100 border-amber-300 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold dark:text-amber-300 text-amber-800 mb-3">Nutrient Deficiency Alerts</h3>
            <ul className="space-y-2 dark:text-amber-100 text-amber-900">
              {deficiencies.map((item, index) => (
                <li key={index}>- {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h2>
          <div className="bg-slate-800/30 rounded-xl p-5">
            <p className="dark:text-slate-300 text-slate-700 leading-relaxed">
              {simplified || displaySummary}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Results;
