import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FOOD_RISKS_KEY = 'foodRisks';
const PERSONAL_CARE_RISKS_KEY = 'personalCareRisks';

function ExposureScore({ showFullDetails = true }) {
  const [foodRisks, setFoodRisks] = useState([]);
  const [personalCareRisks, setPersonalCareRisks] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('low');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Load risks from localStorage
    const storedFoodRisks = JSON.parse(localStorage.getItem(FOOD_RISKS_KEY) || '[]');
    const storedPersonalCareRisks = JSON.parse(localStorage.getItem(PERSONAL_CARE_RISKS_KEY) || '[]');
    
    // Filter to today's risks only
    const today = new Date().toDateString();
    const todayFoodRisks = storedFoodRisks.filter(r => new Date(r.date).toDateString() === today);
    const todayPersonalCareRisks = storedPersonalCareRisks.filter(r => new Date(r.date).toDateString() === today);
    
    setFoodRisks(todayFoodRisks);
    setPersonalCareRisks(todayPersonalCareRisks);
    
    // Calculate total score
    const foodScore = todayFoodRisks.reduce((sum, r) => sum + (r.score || 0), 0);
    const personalCareScore = todayPersonalCareRisks.reduce((sum, r) => sum + (r.score || 0), 0);
    const total = foodScore + personalCareScore;
    
    setTotalScore(total);
    
    // Determine risk level
    if (total < 5) {
      setRiskLevel('low');
    } else if (total <= 10) {
      setRiskLevel('moderate');
    } else {
      setRiskLevel('high');
    }
    
    // Set recommendations for high risk
    if (total > 10) {
      setRecommendations([
        'Reduce processed food consumption',
        'Avoid products with parabens',
        'Switch to safer alternatives',
        'Check ingredient labels carefully'
      ]);
    } else if (total > 5) {
      setRecommendations([
        'Moderate your intake of high-risk items',
        'Look for safer alternatives when possible'
      ]);
    } else {
      setRecommendations([
        'Keep up the healthy choices!',
        'Continue reading labels'
      ]);
    }
  }, []);

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high': return 'text-red-500';
      case 'moderate': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskBgColor = () => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500/10 border-red-500/30';
      case 'moderate': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'bg-green-500/10 border-green-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'high': return '🔴';
      case 'moderate': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getRiskLabel = () => {
    switch (riskLevel) {
      case 'high': return 'HIGH';
      case 'moderate': return 'MODERATE';
      case 'low': return 'LOW';
      default: return 'UNKNOWN';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${getRiskBgColor()} backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getRiskIcon()}</span>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Daily Exposure Score
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Combined food + personal care risk
            </p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${getRiskColor()}`}>
          {totalScore}
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getRiskBgColor()} border`}>
        <span className="text-lg">{getRiskIcon()}</span>
        <span className={`font-bold ${getRiskColor()}`}>
          {getRiskLabel()} RISK
        </span>
      </div>

      {/* Full Details */}
      {showFullDetails && (
        <div className="mt-6 space-y-4">
          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">Food Risks</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {foodRisks.length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Score: {foodRisks.reduce((sum, r) => sum + (r.score || 0), 0)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">Personal Care Risks</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {personalCareRisks.length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Score: {personalCareRisks.reduce((sum, r) => sum + (r.score || 0), 0)}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">
                💡 Recommendations
              </h4>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Utility function to save food risk
export const saveFoodRisk = (riskData) => {
  const existing = JSON.parse(localStorage.getItem(FOOD_RISKS_KEY) || '[]');
  const newRisk = {
    ...riskData,
    date: new Date().toISOString()
  };
  existing.push(newRisk);
  localStorage.setItem(FOOD_RISKS_KEY, JSON.stringify(existing));
};

// Utility function to save personal care risk
export const savePersonalCareRisk = (riskData) => {
  const existing = JSON.parse(localStorage.getItem(PERSONAL_CARE_RISKS_KEY) || '[]');
  const newRisk = {
    ...riskData,
    date: new Date().toISOString()
  };
  existing.push(newRisk);
  localStorage.setItem(PERSONAL_CARE_RISKS_KEY, JSON.stringify(existing));
};

// Utility to clear today's risks (for testing)
export const clearTodayRisks = () => {
  localStorage.setItem(FOOD_RISKS_KEY, '[]');
  localStorage.setItem(PERSONAL_CARE_RISKS_KEY, '[]');
};

export default ExposureScore;
