import { useState } from 'react';
import { analyzePersonalCare } from '../../services/api';
import { motion } from 'framer-motion';

const PRODUCT_TYPES = [
  { value: 'skincare', label: 'Skincare', icon: '🧴' },
  { value: 'haircare', label: 'Hair Care', icon: '💇' },
  { value: 'makeup', label: 'Makeup', icon: '💄' },
  { value: 'bodycare', label: 'Body Care', icon: '🧼' },
  { value: 'sunscreen', label: 'Sunscreen', icon: '☀️' },
  { value: 'soap', label: 'Soap', icon: '🧼' },
  { value: 'toothpaste', label: 'Toothpaste', icon: '🦷' },
  { value: 'deodorant', label: 'Deodorant', icon: '👃' },
];

const SKIN_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive', label: 'Sensitive' },
];

function ComparePersonalCare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  
  // Product 1 state
  const [product1Name, setProduct1Name] = useState('');
  const [product1Ingredients, setProduct1Ingredients] = useState('');
  const [product1Type, setProduct1Type] = useState('');
  const [product1SkinType, setProduct1SkinType] = useState('');
  
  // Product 2 state
  const [product2Name, setProduct2Name] = useState('');
  const [product2Ingredients, setProduct2Ingredients] = useState('');
  const [product2Type, setProduct2Type] = useState('');
  const [product2SkinType, setProduct2SkinType] = useState('');

  // Skin type for analysis
  const [skinType, setSkinType] = useState('');

  const handleCompare = async () => {
    if (!product1Ingredients.trim() || !product2Ingredients.trim()) {
      setError('Please enter ingredients for both products to compare.');
      return;
    }
    
    if (!product1Type || !product2Type) {
      setError('Please select product types for both products.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Comparing personal care products...");
      
      // Analyze both products
      const [result1, result2] = await Promise.all([
        analyzePersonalCare(product1Ingredients, product1Type, product1SkinType || skinType, ''),
        analyzePersonalCare(product2Ingredients, product2Type, product2SkinType || skinType, '')
      ]);
      
      // Calculate scores for comparison
      const getScore = (chemicals, riskLevel) => {
        let score = 50; // Base score
        if (chemicals && chemicals.length > 0) {
          chemicals.forEach(chem => {
            const risk = (chem.risk_level || chem.risk || '').toLowerCase();
            if (risk === 'high') score -= 15;
            else if (risk === 'moderate') score -= 8;
            else if (risk === 'low') score -= 3;
          });
        }
        return Math.max(0, Math.min(100, score));
      };
      
      const score1 = getScore(result1.detected_chemicals, result1.risk_level);
      const score2 = getScore(result2.detected_chemicals, result2.risk_level);
      
      // Determine winner
      const winner = score1 > score2 ? product1Name || 'Product A' : 
                     score2 > score1 ? product2Name || 'Product B' : 'Tie';
      
      const reason = winner === 'Tie' 
        ? 'Both products have similar safety profiles.'
        : score1 > score2 
          ? `${product1Name || 'Product A'} has fewer harmful chemicals and a lower risk level.`
          : `${product2Name || 'Product B'} has fewer harmful chemicals and a lower risk level.`;
      
      setComparisonResult({
        winner,
        reason,
        product1: {
          name: product1Name || 'Product A',
          risk_level: result1.risk_level || 'Unknown',
          risk_score: score1,
          chemicals: result1.detected_chemicals || [],
          chemicals_count: (result1.detected_chemicals || []).length
        },
        product2: {
          name: product2Name || 'Product B',
          risk_level: result2.risk_level || 'Unknown',
          risk_score: score2,
          chemicals: result2.detected_chemicals || [],
          chemicals_count: (result2.detected_chemicals || []).length
        }
      });
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.response?.data?.detail || 'Failed to compare products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setProduct1Name('Brand A Shampoo');
    setProduct1Ingredients('Water, Sodium Lauryl Sulfate, Cocamidopropyl Betaine, Sodium Chloride, Fragrance, Parabens, Formaldehyde, Triclosan');
    setProduct1Type('haircare');
    
    setProduct2Name('Brand B Shampoo');
    setProduct2Ingredients('Water, Cocamidopropyl Betaine, Sodium Cocoyl Isethionate, Glycerin, Aloe Barbadensis Leaf Juice, Chamomile Extract');
    setProduct2Type('haircare');
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Standardized Page Header */}
      <div className="page-header">
        <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
          Product Comparison Tool
        </div>
        <h1 className="page-title text-4xl">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            Compare Products
          </span>
        </h1>
        <p className="page-subtitle">
          Compare two personal care products side by side to make safer choices
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

      {/* Skin Type Selector */}
      <div className="mb-6 flex items-center justify-center space-x-4">
        <label className="text-sm text-slate-400">Your Skin Type:</label>
        <select
          value={skinType}
          onChange={(e) => setSkinType(e.target.value)}
          className="bg-slate-800 text-white border border-purple-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
        >
          <option className="bg-slate-800 text-white" value="">Select skin type</option>
          {SKIN_TYPES.map((type) => (
            <option key={type.value} value={type.value} className="bg-slate-800 text-white">{type.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">Get personalized comparison based on your skin</span>
      </div>

      {/* Product Input Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Product A */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-2 text-sm">
              A
            </span>
            Product A
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Product Name (optional)</label>
              <input
                type="text"
                value={product1Name}
                onChange={(e) => setProduct1Name(e.target.value)}
                placeholder="e.g., Brand A Shampoo"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Product Type *</label>
              <select
                value={product1Type}
                onChange={(e) => setProduct1Type(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
              >
                <option className="bg-slate-800 text-white" value="">Select type</option>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-slate-800 text-white">
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Ingredients</label>
              <textarea
                value={product1Ingredients}
                onChange={(e) => setProduct1Ingredients(e.target.value)}
                placeholder="Enter ingredients list..."
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Product B */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mr-2 text-sm">
              B
            </span>
            Product B
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Product Name (optional)</label>
              <input
                type="text"
                value={product2Name}
                onChange={(e) => setProduct2Name(e.target.value)}
                placeholder="e.g., Brand B Shampoo"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Product Type *</label>
              <select
                value={product2Type}
                onChange={(e) => setProduct2Type(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none pr-10"
              >
                <option className="bg-slate-800 text-white" value="">Select type</option>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-slate-800 text-white">
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Ingredients</label>
              <textarea
                value={product2Ingredients}
                onChange={(e) => setProduct2Ingredients(e.target.value)}
                placeholder="Enter ingredients list..."
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compare Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleCompare}
          disabled={loading || !product1Ingredients.trim() || !product2Ingredients.trim() || !product1Type || !product2Type}
          className={`relative overflow-hidden group px-12 py-4 rounded-2xl ${
            loading || !product1Ingredients.trim() || !product2Ingredients.trim() || !product1Type || !product2Type
              ? 'opacity-70 cursor-not-allowed'
              : ''
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />
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
                <span className="text-lg font-semibold text-white">Compare Products</span>
              </>
            )}
          </div>
        </button>
        
        <button
          onClick={loadExample}
          className="ml-4 text-purple-400 hover:text-purple-300 text-sm"
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
            {/* Product 1 Result */}
            <div className={`p-6 rounded-2xl border-2 ${
              comparisonResult.winner === comparisonResult.product1.name 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-white/10 bg-white/5'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{comparisonResult.product1.name}</h3>
                <span className={`text-2xl font-bold ${getRiskColor(comparisonResult.product1.risk_level)}`}>
                  {comparisonResult.product1.risk_level}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Safety Score</span>
                  <span className={`text-white font-bold ${getScoreColor(comparisonResult.product1.risk_score)}`}>
                    {comparisonResult.product1.risk_score}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Harmful Chemicals</span>
                  <span className="text-white font-medium">{comparisonResult.product1.chemicals_count}</span>
                </div>
              </div>

              {/* Chemical List */}
              {comparisonResult.product1.chemicals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-orange-400 mb-2">Detected Chemicals</h4>
                  <div className="space-y-2">
                    {comparisonResult.product1.chemicals.slice(0, 5).map((chem, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">{chem.name || chem.chemical_name}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          (chem.risk_level || chem.risk || '').toLowerCase() === 'high' ? 'bg-red-500/20 text-red-400' :
                          (chem.risk_level || chem.risk || '').toLowerCase() === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {chem.risk_level || chem.risk || 'Unknown'}
                        </span>
                      </div>
                    ))}
                    {comparisonResult.product1.chemicals.length > 5 && (
                      <p className="text-xs text-slate-500">+{comparisonResult.product1.chemicals.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Product 2 Result */}
            <div className={`p-6 rounded-2xl border-2 ${
              comparisonResult.winner === comparisonResult.product2.name 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-white/10 bg-white/5'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{comparisonResult.product2.name}</h3>
                <span className={`text-2xl font-bold ${getRiskColor(comparisonResult.product2.risk_level)}`}>
                  {comparisonResult.product2.risk_level}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Safety Score</span>
                  <span className={`text-white font-bold ${getScoreColor(comparisonResult.product2.risk_score)}`}>
                    {comparisonResult.product2.risk_score}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Harmful Chemicals</span>
                  <span className="text-white font-medium">{comparisonResult.product2.chemicals_count}</span>
                </div>
              </div>

              {/* Chemical List */}
              {comparisonResult.product2.chemicals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-orange-400 mb-2">Detected Chemicals</h4>
                  <div className="space-y-2">
                    {comparisonResult.product2.chemicals.slice(0, 5).map((chem, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">{chem.name || chem.chemical_name}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          (chem.risk_level || chem.risk || '').toLowerCase() === 'high' ? 'bg-red-500/20 text-red-400' :
                          (chem.risk_level || chem.risk || '').toLowerCase() === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {chem.risk_level || chem.risk || 'Unknown'}
                        </span>
                      </div>
                    ))}
                    {comparisonResult.product2.chemicals.length > 5 && (
                      <p className="text-xs text-slate-500">+{comparisonResult.product2.chemicals.length - 5} more</p>
                    )}
                  </div>
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
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-medium text-white">AI Analysis</h3>
            </div>
            <p className="text-sm text-slate-400">
              Our AI compares harmful chemicals, risk levels, and skin compatibility for you
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-white">Personalized</h3>
              </div>
            <p className="text-sm text-slate-400">
              Select your skin type for personalized recommendations
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-medium text-white">Make Safer Choices</h3>
            </div>
            <p className="text-sm text-slate-400">
              See at a glance which product is safer for your skin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparePersonalCare;
