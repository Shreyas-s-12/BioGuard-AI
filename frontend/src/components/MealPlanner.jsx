import { useState, useEffect } from 'react';
import { getWeeklyMealPlan } from '../services/api';

const FALLBACK_PLAN = {
  day1: ['Oats with fruits', 'Dal + brown rice + salad', 'Vegetable soup + chapati'],
  day2: ['Poha with peanuts', 'Grilled paneer bowl', 'Khichdi + curd'],
  day3: ['Idli + sambar', 'Roti + mixed veg + dal', 'Millet upma + salad'],
  day4: ['Greek yogurt + nuts', 'Quinoa veggie bowl', 'Moong chilla + chutney'],
  day5: ['Besan chilla', 'Rajma + rice + salad', 'Vegetable stir fry + roti'],
  day6: ['Fruit smoothie + seeds', 'Chole + chapati', 'Soup + paneer tikka'],
  day7: ['Dalia + fruits', 'Sambar rice + salad', 'Light pulao + curd']
};

// Cheaper alternatives mapping
const CHEAPER_ALTERNATIVES = {
  'paneer': 'Soya chunks',
  'grilled paneer': 'Soya chunks curry',
  'paneer tikka': 'Soya tikka',
  'paneer bhurji': 'Soya bhurji',
  'shahi paneer': 'Soya curry',
  'palak paneer': 'Soya palak',
  'paneer wrap': 'Soya wrap',
  'grilled chicken': 'Egg curry',
  'chicken curry': 'Egg curry',
  'chicken biryani': 'Egg biryani',
  'chicken externally': 'Egg curry',
  'grilled fish': 'Boiled eggs',
  'fish curry': 'Egg curry',
  'salmon': 'Boiled eggs',
  'tuna': 'Boiled eggs',
  'shrimp': 'Egg curry',
  'prawns': 'Egg curry',
  'crab': 'Egg curry',
  'lobster': 'Egg curry',
  'avocado': 'Banana',
  'greek yogurt': 'Curd',
  'quinoa': 'Rice',
  'berries': 'Apple',
  'salad': 'Cucumber + tomato',
  'smoothie bowl': 'Fruit bowl',
  'protein shake': 'Milk + banana',
  'steak': 'Grilled paneer',
  'salmon': 'Eggs'
};

function MealPlanner({ initialGoal = 'maintain' }) {
  const [dietType, setDietType] = useState('veg');
  const [goal, setGoal] = useState(initialGoal);
  const [budget, setBudget] = useState('medium');
  const [showCheaperAlternatives, setShowCheaperAlternatives] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    fetchMealPlan();
  }, [dietType, goal, budget]);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const response = await getWeeklyMealPlan(goal, dietType, budget);
      if (response?.weekly_plan) {
        setWeeklyPlan(response.weekly_plan);
        setMetadata(response.metadata || null);
      } else {
        setWeeklyPlan(FALLBACK_PLAN);
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      setWeeklyPlan(FALLBACK_PLAN);
    }
    setLoading(false);
  };

  const getCheaperAlternative = (meal) => {
    if (!showCheaperAlternatives) return meal;
    
    const mealLower = meal.toLowerCase();
    for (const [key, value] of Object.entries(CHEAPER_ALTERNATIVES)) {
      if (mealLower.includes(key)) {
        return meal.replace(new RegExp(key, 'gi'), value);
      }
    }
    return meal;
  };

  const getBudgetIcon = (meal) => {
    if (meal.includes('💰')) return meal;
    return meal;
  };

  const getDietIcon = () => {
    switch (dietType) {
      case 'veg': return '🌱';
      case 'non-veg': return '🍗';
      case 'eggetarian': return '🥚';
      case 'vegan': return '🌿';
      default: return '🌱';
    }
  };

  const getGoalBadge = () => {
    switch (goal) {
      case 'weight loss': return { text: 'Weight Loss', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
      case 'weight gain': return { text: 'Weight Gain', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      default: return { text: 'Maintenance', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  const getBudgetBadge = () => {
    switch (budget) {
      case 'low': return { text: '💰', color: 'bg-green-500/20 text-green-300' };
      case 'medium': return { text: '💰💰', color: 'bg-yellow-500/20 text-yellow-300' };
      case 'high': return { text: '💰💰💰', color: 'bg-purple-500/20 text-purple-300' };
      default: return { text: '💰💰', color: 'bg-yellow-500/20 text-yellow-300' };
    }
  };

  const goalBadge = getGoalBadge();
  const budgetBadge = getBudgetBadge();

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-6">
      <h3 className="text-lg font-semibold text-cyan-300 mb-4">🍽️ Weekly Meal Planner</h3>
      
      {/* Selection Panel */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Diet Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🥗 Diet Type
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {['veg', 'non-veg', 'eggetarian', 'vegan'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDietType(type)}
                  className={`py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                    dietType === type
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {type === 'veg' ? '🌱 Veg' : type === 'non-veg' ? '🍗 Non-Veg' : type === 'eggetarian' ? '🥚 Egg' : '🌿 Vegan'}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🎯 Goal
            </label>
            <div className="flex gap-2">
              {[
                { value: 'weight loss', label: 'Loss' },
                { value: 'maintain', label: 'Maintain' },
                { value: 'weight gain', label: 'Gain' }
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    goal === g.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              💰 Budget
            </label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ].map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBudget(b.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    budget === b.value
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cheaper Alternatives Toggle */}
        <div className="flex items-center gap-3 pt-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCheaperAlternatives}
              onChange={(e) => setShowCheaperAlternatives(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ml-3 text-sm font-medium text-slate-300">
              💡 Suggest cheaper alternatives
            </span>
          </label>
        </div>
      </div>

      {/* Current Selection Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${goalBadge.color}`}>
          {goalBadge.text}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${budgetBadge.color}`}>
          {budgetBadge.text}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {getDietIcon()} {dietType === 'vegan' ? 'Vegan' : dietType.charAt(0).toUpperCase() + dietType.slice(1)}
        </span>
        {dietType === 'vegan' && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            ✅ 100% Plant-Based
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      ) : (
        /* Meal Plan Grid */
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 7 }, (_, idx) => idx + 1).map((dayNum) => {
            const key = `day${dayNum}`;
            const meals = weeklyPlan[key] || FALLBACK_PLAN[key] || [];
            
            return (
              <div 
                key={key} 
                className="rounded-xl border border-white/10 bg-slate-900/45 p-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-cyan-200">Day {dayNum}</p>
                  <span className="text-xs text-slate-400">
                    {getDietIcon()}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-slate-400">🌅 Breakfast:</span>{' '}
                    <span className="text-slate-200">
                      {getCheaperAlternative(meals[0] || 'Balanced meal')}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">☀️ Lunch:</span>{' '}
                    <span className="text-slate-200">
                      {getCheaperAlternative(meals[1] || 'Balanced meal')}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">🌙 Dinner:</span>{' '}
                    <span className="text-slate-200">
                      {getCheaperAlternative(meals[2] || 'Balanced meal')}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MealPlanner;
