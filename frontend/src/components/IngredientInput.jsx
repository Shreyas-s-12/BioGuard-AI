import { useState } from 'react';

function IngredientInput({ onAnalyze, loading, hasImage = false }) {
  const [ingredients, setIngredients] = useState('');
  const [nutrition, setNutrition] = useState({
    sugar: '',
    sodium: '',
    saturated_fat: '',
    trans_fat: '',
    calories: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(ingredients, nutrition);
  };

  // Allow submit if there's an image OR if ingredients are entered
  const canSubmit = loading || hasImage || ingredients.trim();

  const handleNutritionChange = (field, value) => {
    setNutrition(prev => ({ ...prev, [field]: value }));
  };

  const nutritionFields = [
    { key: 'sugar', label: 'Sugar', unit: 'g' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
    { key: 'saturated_fat', label: 'Sat. Fat', unit: 'g' },
    { key: 'trans_fat', label: 'Trans Fat', unit: 'g' },
    { key: 'calories', label: 'Calories', unit: 'kcal' },
  ];

  return (
    <div className="glass rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <span className="w-7 h-7 bg-nutri-secondary/20 rounded-lg flex items-center justify-center mr-2">
          📝
        </span>
        Manual Input
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">
            Ingredients
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., water, sugar, sodium benzoate..."
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition resize-none text-sm"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {nutritionFields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs text-slate-400 mb-1">
                {field.label} ({field.unit})
              </label>
              <input
                type="number"
                value={nutrition[field.key]}
                onChange={(e) => handleNutritionChange(field.key, e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-secondary focus:ring-1 focus:ring-nutri-secondary outline-none text-sm"
              />
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-2 bg-gradient-to-r from-nutri-primary to-nutri-secondary hover:from-nutri-primary/80 hover:to-nutri-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center text-sm"
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
  );
}

export default IngredientInput;
