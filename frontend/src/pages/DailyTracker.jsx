import { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getDailyNutritionGoals } from '../services/api';

const DEFAULT_PROFILE = {
  age: 25,
  weight: 70,
  goal: 'maintain'
};

const DEFAULT_GOALS = {
  calories_goal: 2100,
  protein_goal: 98,
  limits: {
    sugar: 30,
    sodium: 2000
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const sanitizeProfile = (raw) => {
  const age = clamp(Number(raw?.age) || DEFAULT_PROFILE.age, 10, 120);
  const weight = clamp(Number(raw?.weight) || DEFAULT_PROFILE.weight, 25, 300);
  const normalizedGoal = String(raw?.goal || DEFAULT_PROFILE.goal).trim().toLowerCase();
  const allowedGoals = ['weight loss', 'weight gain', 'maintain'];
  const goal = allowedGoals.includes(normalizedGoal) ? normalizedGoal : DEFAULT_PROFILE.goal;

  return {
    age: Math.round(age),
    weight: Math.round(weight * 10) / 10,
    goal
  };
};

const sanitizeGoals = (raw) => {
  const calories_goal = clamp(Number(raw?.calories_goal) || DEFAULT_GOALS.calories_goal, 1200, 4000);
  const protein_goal = clamp(Number(raw?.protein_goal) || DEFAULT_GOALS.protein_goal, 40, 260);
  const sugar = clamp(Number(raw?.limits?.sugar) || DEFAULT_GOALS.limits.sugar, 10, 80);
  const sodium = clamp(Number(raw?.limits?.sodium) || DEFAULT_GOALS.limits.sodium, 1200, 3500);

  return {
    calories_goal: Math.round(calories_goal),
    protein_goal: Math.round(protein_goal),
    limits: {
      sugar: Math.round(sugar),
      sodium: Math.round(sodium)
    }
  };
};

function DailyTracker() {
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('nutrition_goals_profile') || '{}');
      return sanitizeProfile(parsed);
    } catch (_err) {
      return DEFAULT_PROFILE;
    }
  });
  const [dailyGoals, setDailyGoals] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('nutrition_goals_data') || '{}');
      return sanitizeGoals(parsed);
    } catch (_err) {
      return DEFAULT_GOALS;
    }
  });
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState('');

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('daily_intake') || '[]');
      const safeEntries = Array.isArray(parsed)
        ? parsed.filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              typeof item.name === 'string' &&
              Number.isFinite(Number(item.risk_score)) &&
              Number.isFinite(Number(item.timestamp))
          )
        : [];
      setEntries(safeEntries);
    } catch (_err) {
      setEntries([]);
    }
  }, []);

  const fetchGoals = async (nextProfile) => {
    const safeProfile = sanitizeProfile(nextProfile);
    setGoalsLoading(true);
    setGoalsError('');

    try {
      const response = await getDailyNutritionGoals(
        safeProfile.age,
        safeProfile.weight,
        safeProfile.goal
      );
      const safeGoals = sanitizeGoals(response);
      setDailyGoals(safeGoals);
      localStorage.setItem('nutrition_goals_profile', JSON.stringify(safeProfile));
      localStorage.setItem('nutrition_goals_data', JSON.stringify(safeGoals));
    } catch (_err) {
      const fallbackGoals = sanitizeGoals(DEFAULT_GOALS);
      setDailyGoals(fallbackGoals);
      setGoalsError('Using default goals right now.');
      localStorage.setItem('nutrition_goals_profile', JSON.stringify(safeProfile));
      localStorage.setItem('nutrition_goals_data', JSON.stringify(fallbackGoals));
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)),
    [entries]
  );

  const averageRisk = useMemo(() => {
    if (!sortedEntries.length) return 0;
    const total = sortedEntries.reduce(
      (sum, item) => sum + Math.max(0, Math.min(100, Number(item.risk_score) || 0)),
      0
    );
    return Math.round((total / sortedEntries.length) * 10) / 10;
  }, [sortedEntries]);

  const meterColor =
    averageRisk >= 70 ? 'from-red-500 to-orange-500' :
    averageRisk >= 40 ? 'from-yellow-400 to-amber-500' :
    'from-green-500 to-emerald-500';

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const safeProfile = sanitizeProfile(profile);
    setProfile(safeProfile);
    await fetchGoals(safeProfile);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm mb-4">
            Daily Intake Risk Tracker
          </div>
          <h1 className="text-4xl font-bold text-white">Daily Tracker</h1>
          <p className="text-slate-400 mt-2">Track average food risk score and your personalized nutrition goals.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Set Your Profile</h2>
          <form onSubmit={handleProfileSubmit} className="grid md:grid-cols-4 gap-4">
            <label className="text-sm text-slate-300">
              Age
              <input
                type="number"
                min="10"
                max="120"
                value={profile.age}
                onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </label>

            <label className="text-sm text-slate-300">
              Weight (kg)
              <input
                type="number"
                min="25"
                max="300"
                step="0.1"
                value={profile.weight}
                onChange={(e) => setProfile((prev) => ({ ...prev, weight: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </label>

            <label className="text-sm text-slate-300">
              Goal
              <select
                value={profile.goal}
                onChange={(e) => setProfile((prev) => ({ ...prev, goal: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="weight loss">Weight Loss</option>
                <option value="weight gain">Weight Gain</option>
                <option value="maintain">Maintain</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={goalsLoading}
                className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-white font-semibold disabled:opacity-60"
              >
                {goalsLoading ? 'Updating...' : 'Update Goals'}
              </button>
            </div>
          </form>
          {goalsError && <p className="mt-3 text-sm text-amber-300">{goalsError}</p>}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Daily Goals</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/45 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Calories</p>
              <p className="text-2xl font-bold text-cyan-300">{dailyGoals.calories_goal}</p>
              <p className="text-xs text-slate-500">kcal / day</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/45 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Protein</p>
              <p className="text-2xl font-bold text-emerald-300">{dailyGoals.protein_goal}</p>
              <p className="text-xs text-slate-500">grams / day</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/45 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Sugar Limit</p>
              <p className="text-2xl font-bold text-yellow-300">{dailyGoals.limits.sugar}</p>
              <p className="text-xs text-slate-500">grams / day</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/45 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Sodium Limit</p>
              <p className="text-2xl font-bold text-orange-300">{dailyGoals.limits.sodium}</p>
              <p className="text-xs text-slate-500">mg / day</p>
            </div>
          </div>
        </div>

        {!sortedEntries.length ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-300">
            No data yet
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Daily Risk %</h2>
                <span className="text-2xl font-bold text-cyan-300">{averageRisk}%</span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${meterColor}`}
                  style={{ width: `${Math.max(0, Math.min(100, averageRisk))}%` }}
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Foods Eaten</h2>
              <div className="space-y-3">
                {sortedEntries.map((item, index) => (
                  <div
                    key={`${item.timestamp}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/45 px-4 py-3"
                  >
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(Number(item.timestamp)).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-cyan-300 font-semibold">
                      {Math.max(0, Math.min(100, Number(item.risk_score) || 0))}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DailyTracker;
