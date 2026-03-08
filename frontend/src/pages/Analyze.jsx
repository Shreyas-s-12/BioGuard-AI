import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyzeNutrition } from '../services/api';

function Analyze() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nutritionText, setNutritionText] = useState('');
  const [ingredientText, setIngredientText] = useState('');
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!nutritionText.trim() && !ingredientText.trim()) {
      setError('Please paste nutrition facts or ingredients to analyze.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Sending request to /analyze-nutrition");
      
      // Combine nutrition text and ingredient text
      const combinedText = nutritionText + '\n' + ingredientText;
      
      const result = await analyzeNutrition(combinedText);
      
      console.log('Analysis result received:', result);
      
      // Store results in sessionStorage for the results page
      sessionStorage.setItem('analysisResults', JSON.stringify(result));
      
      // Save to history in localStorage
      const historyItem = {
        ...result,
        date: new Date().toISOString()
      };
      const existingHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      existingHistory.push(historyItem);
      localStorage.setItem('analysisHistory', JSON.stringify(existingHistory));
      
      // Navigate to results page
      navigate('/results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exampleNutrition = `Amount Per Serving
Calories 140
Total Fat 8g
Saturated Fat 1g
Sodium 180mg
Total Carbohydrate 37g
Total Sugars 12g
Protein 2g`;

  const exampleIngredients = `Water, High Fructose Corn Syrup, Citric Acid, Sodium Benzoate, 
Potassium Sorbate, Aspartame, Natural Flavor, Phosphoric Acid, Caramel Color`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Food Analysis</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Paste nutrition facts and ingredients to analyze health risks
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="glass rounded-2xl p-6 mb-8">
          <label className="block text-lg font-semibold mb-4 text-white">
            Nutrition Facts
          </label>
          <textarea
            value={nutritionText}
            onChange={(e) => setNutritionText(e.target.value)}
            placeholder="Paste nutrition facts here...

Example:
Amount Per Serving
Calories 140
Total Fat 8g
Sodium 180mg
Total Sugars 12g"
            className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nutri-primary focus:border-transparent resize-none mb-4"
          />
          
          <label className="block text-lg font-semibold mb-4 text-white">
            Ingredients (Optional)
          </label>
          <textarea
            value={ingredientText}
            onChange={(e) => setIngredientText(e.target.value)}
            placeholder="Paste ingredients list here...

Example:
Water, Sugar, Sodium Benzoate, Aspartame, Phosphoric Acid"
            className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nutri-secondary focus:border-transparent resize-none"
          />
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || (!nutritionText.trim() && !ingredientText.trim())}
              className="flex-1 bg-nutri-primary hover:bg-nutri-primary/90 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze Food'}
            </button>
            <button
              onClick={() => {
                setNutritionText(exampleNutrition);
                setIngredientText(exampleIngredients);
              }}
              className="px-6 py-3 border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Load Example
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="w-8 h-8 bg-nutri-accent/20 rounded-lg flex items-center justify-center mr-2">
              💡
            </span>
            Tips for Better Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-slate-300">
            <div className="flex items-start space-x-2">
              <span className="text-nutri-primary">•</span>
              <p>Copy the entire nutrition facts label for accurate nutrient detection</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-nutri-primary">•</span>
              <p>Include the ingredients list to detect additives and preservatives</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-nutri-primary">•</span>
              <p>Make sure to include units (mg, g)</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-nutri-primary">•</span>
              <p>Our system maps ingredients to potential long-term health effects</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analyze;
