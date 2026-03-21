import { useState } from 'react';
import Layout from '../components/Layout';
import { compareFoods } from '../services/api';

function CompareFoods() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  
  // Food 1 state
  const [food1Name, setFood1Name] = useState('');
  const [food1Ingredients, setFood1Ingredients] = useState('');
  const [food1Nutrition, setFood1Nutrition] = useState('');
  
  // Food 2 state
  const [food2Name, setFood2Name] = useState('');
  const [food2Ingredients, setFood2Ingredients] = useState('');
  const [food2Nutrition, setFood2Nutrition] = useState('');
  
  // Health condition
  const [healthCondition, setHealthCondition] = useState('');

  const handleCompare = async () => {
    if (!food1Ingredients.trim() || !food2Ingredients.trim()) {
      setError('Please enter ingredients for both foods to compare.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Comparing foods...");
      
      const result = await compareFoods(
        food1Name || 'Food A', food1Ingredients, food1Nutrition,
        food2Name || 'Food B', food2Ingredients, food2Nutrition,
        healthCondition || null
      );
      
      console.log('Comparison result:', result);
      setComparisonResult(result);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.response?.data?.detail || 'Failed to compare foods. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setFood1Name('Cola');
    setFood1Ingredients('Carbonated Water, High Fructose Corn Syrup, Caramel Color, Phosphoric Acid, Caffeine, Natural Flavors');
    setFood1Nutrition('Calories 140 Sodium 45mg Total Sugars 39g');
    
    setFood2Name('Sparkling Water');
    setFood2Ingredients('Carbonated Water, Natural Mineral Water');
    setFood2Nutrition('Calories 0 Sodium 0mg Total Sugars 0g');
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getProcessingColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'ultra processed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'processed': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'minimally processed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'whole food': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Standardized Page Header */}
        <div className="page-header">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
            Food Comparison Tool
          </div>
          <h1 className="page-title text-4xl">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Compare Foods
            </span>
          </h1>
          <p className="page-subtitle">
            Compare two foods side by side to make healthier choices
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Health Mode Selector */}
        <div className="mb-6 flex items-center justify-center space-x-4">
          <label className="text-sm text-slate-400">Health Mode:</label>
          <select
            value={healthCondition}
            onChange={(e) => setHealthCondition(e.target.value)}
            className="bg-slate-800 text-white border border-purple-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
          >
            <option className="bg-slate-800 text-white" value="">None</option>
            <option className="bg-slate-800 text-white" value="diabetes">Diabetes</option>
            <option className="bg-slate-800 text-white" value="hypertension">Hypertension</option>
            <option className="bg-slate-800 text-white" value="heart_disease">Heart Disease</option>
            <option className="bg-slate-800 text-white" value="kidney_disease">Kidney Disease</option>
            <option className="bg-slate-800 text-white" value="obesity">Obesity</option>
            <option className="bg-slate-800 text-white" value="fatty_liver">Fatty Liver</option>
            <option className="bg-slate-800 text-white" value="pcos">PCOS</option>
            <option className="bg-slate-800 text-white" value="thyroid_disorder">Thyroid Disorder</option>
            <option className="bg-slate-800 text-white" value="digestive_disorder">Digestive Disorder</option>
            <option className="bg-slate-800 text-white" value="pregnancy">Pregnancy</option>
          </select>
          <span className="text-xs text-slate-500">Get personalized comparison based on your health</span>
        </div>

        {/* Food Input Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Food A */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 text-sm">
                A
              </span>
              Food A
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Food Name (optional)</label>
                <input
                  type="text"
                  value={food1Name}
                  onChange={(e) => setFood1Name(e.target.value)}
                  placeholder="e.g., Cola"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Ingredients</label>
                <textarea
                  value={food1Ingredients}
                  onChange={(e) => setFood1Ingredients(e.target.value)}
                  placeholder="Enter ingredients list..."
                  className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nutrition Facts (optional)</label>
                <textarea
                  value={food1Nutrition}
                  onChange={(e) => setFood1Nutrition(e.target.value)}
                  placeholder="e.g., Calories 140 Sodium 45mg..."
                  className="w-full h-20 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Food B */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 text-sm">
                B
              </span>
              Food B
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Food Name (optional)</label>
                <input
                  type="text"
                  value={food2Name}
                  onChange={(e) => setFood2Name(e.target.value)}
                  placeholder="e.g., Water"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Ingredients</label>
                <textarea
                  value={food2Ingredients}
                  onChange={(e) => setFood2Ingredients(e.target.value)}
                  placeholder="Enter ingredients list..."
                  className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nutrition Facts (optional)</label>
                <textarea
                  value={food2Nutrition}
                  onChange={(e) => setFood2Nutrition(e.target.value)}
                  placeholder="e.g., Calories 0 Sodium 0mg..."
                  className="w-full h-20 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compare Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleCompare}
            disabled={loading || !food1Ingredients.trim() || !food2Ingredients.trim()}
            className={`relative overflow-hidden group px-12 py-4 rounded-2xl ${
              loading || !food1Ingredients.trim() || !food2Ingredients.trim()
                ? 'opacity-70 cursor-not-allowed'
                : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
            <div className="relative flex items-center space-x-3">
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-lg font-semibold text-white">Comparing...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-lg font-semibold text-white">Compare Foods</span>
                </>
              )}
            </div>
          </button>
          
          <button
            onClick={loadExample}
            className="ml-4 text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Load Example
          </button>
        </div>

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 animate-fadeIn">
            {/* Winner Banner */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl">
                <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-400 font-semibold">Winner: {comparisonResult.winner}</span>
              </div>
              <p className="text-slate-400 mt-3">{comparisonResult.reason}</p>
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Food 1 Result */}
              <div className={`p-6 rounded-2xl border-2 ${
                comparisonResult.winner === comparisonResult.food1.name 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{comparisonResult.food1.name}</h3>
                  <span className={`text-2xl font-bold ${getRiskColor(comparisonResult.food1.risk_level)}`}>
                    {comparisonResult.food1.risk_level}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="text-white font-medium">{comparisonResult.food1.risk_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Additives</span>
                    <span className="text-white font-medium">{comparisonResult.food1.additives_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sugar Risk</span>
                    <span className="text-white font-medium">{comparisonResult.food1.sugar_risk}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Processing Level</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getProcessingColor(comparisonResult.food1.processing_level)}`}>
                      {comparisonResult.food1.processing_level}
                    </span>
                  </div>
                </div>

                {/* Health Warnings */}
                {comparisonResult.food1.health_warnings?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-orange-400 mb-2">Health Warnings</h4>
                    {comparisonResult.food1.health_warnings.map((warning, idx) => (
                      <p key={idx} className="text-xs text-orange-300">{warning.message}</p>
                    ))}
                  </div>
                )}

                {/* Additive Interactions */}
                {comparisonResult.food1.additive_interactions?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-red-400 mb-2">Additive Interactions</h4>
                    {comparisonResult.food1.additive_interactions.map((interaction, idx) => (
                      <p key={idx} className="text-xs text-red-300">{interaction.warning}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Food 2 Result */}
              <div className={`p-6 rounded-2xl border-2 ${
                comparisonResult.winner === comparisonResult.food2.name 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{comparisonResult.food2.name}</h3>
                  <span className={`text-2xl font-bold ${getRiskColor(comparisonResult.food2.risk_level)}`}>
                    {comparisonResult.food2.risk_level}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="text-white font-medium">{comparisonResult.food2.risk_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Additives</span>
                    <span className="text-white font-medium">{comparisonResult.food2.additives_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sugar Risk</span>
                    <span className="text-white font-medium">{comparisonResult.food2.sugar_risk}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Processing Level</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getProcessingColor(comparisonResult.food2.processing_level)}`}>
                      {comparisonResult.food2.processing_level}
                    </span>
                  </div>
                </div>

                {/* Health Warnings */}
                {comparisonResult.food2.health_warnings?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-orange-400 mb-2">Health Warnings</h4>
                    {comparisonResult.food2.health_warnings.map((warning, idx) => (
                      <p key={idx} className="text-xs text-orange-300">{warning.message}</p>
                    ))}
                  </div>
                )}

                {/* Additive Interactions */}
                {comparisonResult.food2.additive_interactions?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-red-400 mb-2">Additive Interactions</h4>
                    {comparisonResult.food2.additive_interactions.map((interaction, idx) => (
                      <p key={idx} className="text-xs text-red-300">{interaction.warning}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {!comparisonResult && (
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-medium text-white">AI Analysis</h3>
              </div>
              <p className="text-sm text-slate-400">
                Our AI compares additives, processing levels, and health risks for you
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-white">Personalized</h3>
              </div>
              <p className="text-sm text-slate-400">
                Select your health condition for personalized warnings and recommendations
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-medium text-white">Make Better Choices</h3>
              </div>
              <p className="text-sm text-slate-400">
                See at a glance which food is safer for you and your family
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default CompareFoods;
