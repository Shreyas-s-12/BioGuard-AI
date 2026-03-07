import { useState, useCallback } from 'react'
import axios from 'axios'

// API Configuration
const API_URL = 'http://localhost:8000/api'

// Components
function Header() {
  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-nutri-primary to-nutri-accent rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">NutriGuard AI</h1>
              <p className="text-xs text-slate-400">Smart Food Safety Platform</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="px-3 py-1 bg-nutri-primary/20 text-nutri-primary rounded-full text-sm">
              🔬 300+ Additives
            </span>
            <span className="px-3 py-1 bg-nutri-secondary/20 text-nutri-secondary rounded-full text-sm">
              📊 Real-time Analysis
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function UploadZone({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      await onUpload(file)
    }
  }, [onUpload])

  const handleInputChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      await onUpload(file)
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-nutri-primary/20 rounded-lg flex items-center justify-center mr-2">
          📷
        </span>
        Upload Food Label
      </h2>
      
      <div 
        className={`upload-zone rounded-xl p-8 text-center ${dragActive ? 'dragging' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="spinner w-12 h-12 mb-4"></div>
            <p className="text-slate-400">Analyzing food label...</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center">
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg mb-4" />
            <p className="text-slate-400 text-sm">Image loaded - analyzing...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Drop your food label image here</p>
            <p className="text-slate-400 text-sm mb-4">or click to browse</p>
            <label className="inline-flex items-center px-4 py-2 bg-nutri-primary hover:bg-nutri-primary/80 text-white rounded-lg cursor-pointer transition">
              <span>Select Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleInputChange}
              />
            </label>
            <p className="text-xs text-slate-500 mt-4">Supports JPG, PNG, WEBP</p>
          </>
        )}
      </div>
    </div>
  )
}

function ManualInput({ onAnalyze, loading }) {
  const [ingredients, setIngredients] = useState('')
  const [nutrition, setNutrition] = useState({
    sugar: '',
    sodium: '',
    saturated_fat: '',
    trans_fat: '',
    calories: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAnalyze(ingredients, nutrition)
  }

  const handleNutritionChange = (field, value) => {
    setNutrition(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-nutri-secondary/20 rounded-lg flex items-center justify-center mr-2">
          📝
        </span>
        Manual Input
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">
            Ingredients (comma-separated)
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., water, sugar, sodium benzoate, artificial flavor..."
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition resize-none"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(nutrition).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs text-slate-400 mb-1 capitalize">
                {key.replace('_', ' ')} (g)
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleNutritionChange(key, e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-secondary focus:ring-1 focus:ring-nutri-secondary outline-none text-sm"
              />
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={loading || !ingredients.trim()}
          className="w-full py-3 bg-gradient-to-r from-nutri-primary to-nutri-secondary hover:from-nutri-primary/80 hover:to-nutri-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="spinner w-5 h-5 mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Analyze Food
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function RiskMeter({ score, level }) {
  const getColor = () => {
    if (score >= 70) return '#ef4444'
    if (score >= 40) return '#eab308'
    return '#22c55e'
  }

  const getMessage = () => {
    if (score >= 70) return 'High Risk'
    if (score >= 40) return 'Moderate Risk'
    return 'Low Risk'
  }

  const circumference = 2 * Math.PI * 45

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <span className="w-8 h-8 bg-high-risk/20 rounded-lg flex items-center justify-center mr-2">
          🎯
        </span>
        Health Risk Score
      </h2>
      
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="45"
              stroke="#334155"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="45"
              stroke={getColor()}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (score / 100) * circumference}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: getColor() }}>
              {score}
            </span>
            <span className="text-sm text-slate-400">out of 100</span>
          </div>
        </div>
      </div>
      
      <div className={`mt-4 text-center py-2 rounded-lg ${score >= 70 ? 'bg-high-risk/20' : score >= 40 ? 'bg-moderate/20' : 'bg-safe/20'}`}>
        <span className={`text-lg font-semibold ${score >= 70 ? 'text-high-risk' : score >= 40 ? 'text-moderate' : 'text-safe'}`}>
          {getMessage()}
        </span>
      </div>
    </div>
  )
}

function RiskBreakdown({ scores }) {
  const items = [
    { label: 'Sugar Risk', value: scores.sugar_risk_score, color: 'bg-pink-500' },
    { label: 'Fat Risk', value: scores.fat_risk_score, color: 'bg-orange-500' },
    { label: 'Sodium Risk', value: scores.sodium_risk_score, color: 'bg-purple-500' },
    { label: 'Chemical Risk', value: scores.chemical_risk_score, color: 'bg-red-500' }
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-nutri-accent/20 rounded-lg flex items-center justify-center mr-2">
          📊
        </span>
        Risk Breakdown
      </h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{item.label}</span>
              <span className="font-medium">{item.value}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChemicalCard({ chemical }) {
  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-high-risk bg-high-risk/20'
      case 'moderate': return 'text-moderate bg-moderate/20'
      case 'low': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-safe bg-safe/20'
    }
  }

  return (
    <div className="glass rounded-xl p-4 card-hover">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-white">{chemical.chemical_name}</h3>
          <span className="text-xs text-slate-400">{chemical.e_number}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(chemical.risk_level)}`}>
          {chemical.risk_level}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <p className="text-slate-300">
          <span className="text-slate-400">Category:</span> {chemical.category}
        </p>
        <p className="text-slate-300">
          <span className="text-slate-400">Purpose:</span> {chemical.purpose}
        </p>
        {chemical.health_concerns && (
          <p className="text-slate-300">
            <span className="text-slate-400">Concerns:</span> {chemical.health_concerns}
          </p>
        )}
        <p className="text-slate-400 text-xs">
          <span className="text-slate-500">Detected as:</span> {chemical.detected_in}
        </p>
      </div>
    </div>
  )
}

function ChemicalsList({ chemicals }) {
  if (!chemicals || chemicals.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="w-8 h-8 bg-safe/20 rounded-lg flex items-center justify-center mr-2">
            ✅
          </span>
          Detected Chemicals
        </h2>
        <p className="text-slate-400 text-center py-4">No harmful chemicals detected!</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-high-risk/20 rounded-lg flex items-center justify-center mr-2">
          🧪
        </span>
        Detected Chemicals ({chemicals.length})
      </h2>
      
      <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
        {chemicals.map((chem, idx) => (
          <div key={idx} className="chemical-tag" style={{ animationDelay: `${idx * 0.1}s` }}>
            <ChemicalCard chemical={chem} />
          </div>
        ))}
      </div>
    </div>
  )
}

function HiddenSugars({ sugars }) {
  if (!sugars || sugars.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="w-8 h-8 bg-safe/20 rounded-lg flex items-center justify-center mr-2">
            🍬
          </span>
          Hidden Sugars
        </h2>
        <p className="text-slate-400 text-center py-4">No hidden sugars detected!</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-2">
          🍬
        </span>
        Hidden Sugars Detected ({sugars.length})
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {sugars.map((sugar, idx) => (
          <span 
            key={idx}
            className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm chemical-tag"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {sugar}
          </span>
        ))}
      </div>
    </div>
  )
}

function NutritionIssues({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="w-8 h-8 bg-safe/20 rounded-lg flex items-center justify-center mr-2">
            🥗
          </span>
          Nutrition Analysis
        </h2>
        <p className="text-slate-400 text-center py-4">No nutrition concerns detected!</p>
      </div>
    )
  }

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-high-risk bg-high-risk/20 border-high-risk/30'
      case 'moderate': return 'text-moderate bg-moderate/20 border-moderate/30'
      default: return 'text-safe bg-safe/20 border-safe/30'
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mr-2">
          🥗
        </span>
        Nutrition Concerns ({issues.length})
      </h2>
      
      <div className="space-y-3">
        {issues.map((issue, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-lg border ${getRiskColor(issue.risk_level)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium capitalize">{issue.nutrient.replace('_', ' ')}</span>
              <span className="text-sm font-semibold">
                {issue.value}{issue.unit}
              </span>
            </div>
            <p className="text-sm opacity-80">{issue.concern}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Recommendations({ recommendation, processingLevel }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-nutri-primary/20 rounded-lg flex items-center justify-center mr-2">
          💡
        </span>
        Recommendations
      </h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <p className="text-slate-200 leading-relaxed">{recommendation}</p>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <span className="text-slate-400">Processing Level</span>
          <span className="px-3 py-1 bg-nutri-accent/20 text-nutri-accent rounded-full text-sm font-medium capitalize">
            {processingLevel?.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  )
}

function IngredientsDisplay({ ingredients }) {
  if (!ingredients || ingredients.length === 0) return null

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-nutri-secondary/20 rounded-lg flex items-center justify-center mr-2">
          📋
        </span>
        Extracted Ingredients
      </h2>
      
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {ingredients.map((ing, idx) => (
          <span 
            key={idx}
            className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm"
          >
            {ing}
          </span>
        ))}
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const analyzeFood = async (fileOrIngredients, nutritionData = null) => {
    setLoading(true)
    setError(null)
    
    try {
      let response
      
      if (fileOrIngredients instanceof File) {
        const formData = new FormData()
        formData.append('file', fileOrIngredients)
        if (nutritionData) {
          formData.append('nutrition', JSON.stringify(nutritionData))
        }
        response = await axios.post(`${API_URL}/analyze`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        response = await axios.post(`${API_URL}/analyze`, null, {
          params: {
            ingredients: fileOrIngredients,
            nutrition: nutritionData ? JSON.stringify(nutritionData) : null
          }
        })
      }
      
      setResult(response.data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to analyze food')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (file) => {
    analyzeFood(file)
  }

  const handleManualAnalyze = (ingredients, nutrition) => {
    const nutritionObj = {}
    Object.entries(nutrition).forEach(([key, value]) => {
      if (value) nutritionObj[key] = parseFloat(value)
    })
    analyzeFood(ingredients, nutritionObj)
  }

  return (
    <div className="min-h-screen pb-12">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Smart Food Safety Analysis</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Upload a food label image or enter ingredients manually to detect harmful chemicals, 
            hidden sugars, and get a comprehensive health risk score.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-high-risk/20 border border-high-risk/30 rounded-xl text-high-risk">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <UploadZone onUpload={handleFileUpload} loading={loading} />
          <ManualInput onAnalyze={handleManualAnalyze} loading={loading} />
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            {/* Risk Overview */}
            <div className="grid lg:grid-cols-2 gap-6">
              <RiskMeter score={result.risk_score} level={result.risk_level} />
              <RiskBreakdown scores={result} />
            </div>

            {/* Main Analysis */}
            <div className="grid lg:grid-cols-2 gap-6">
              <ChemicalsList chemicals={result.detected_chemicals} />
              <HiddenSugars sugars={result.hidden_sugars} />
            </div>

            {/* Additional Analysis */}
            <div className="grid lg:grid-cols-2 gap-6">
              <NutritionIssues issues={result.nutrition_issues} />
              <Recommendations 
                recommendation={result.recommendation} 
                processingLevel={result.processing_level}
              />
            </div>

            {/* OCR Results */}
            {result.ocr_text && (
              <IngredientsDisplay ingredients={result.extracted_ingredients} />
            )}
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-nutri-primary/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">300+ Additives</h3>
              <p className="text-slate-400 text-sm">
                Our database contains over 300 real food additives, preservatives, and chemicals with detailed risk analysis.
              </p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-nutri-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">📷</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">OCR Scanning</h3>
              <p className="text-slate-400 text-sm">
                Upload food label images and our AI will extract and analyze ingredients automatically.
              </p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-nutri-accent/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Health Scoring</h3>
              <p className="text-slate-400 text-sm">
                Get a comprehensive health risk score based on sugar, fat, sodium, and chemical content.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">
            NutriGuard AI - Smart Food Safety & Chemical Risk Awareness Platform
          </p>
          <p className="text-slate-500 text-sm mt-2">
            For educational purposes only. Consult healthcare professionals for dietary advice.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
