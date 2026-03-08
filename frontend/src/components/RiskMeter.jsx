function RiskMeter({ score }) {
  const getColor = () => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#eab308';
    return '#22c55e';
  };

  const getMessage = () => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  const getBgClass = () => {
    if (score >= 70) return 'bg-high-risk/20';
    if (score >= 40) return 'bg-moderate/20';
    return 'bg-safe/20';
  };

  const getTextClass = () => {
    if (score >= 70) return 'text-high-risk';
    if (score >= 40) return 'text-moderate';
    return 'text-safe';
  };

  const circumference = 2 * Math.PI * 45;

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
      
      <div className={`mt-4 text-center py-2 rounded-lg ${getBgClass()}`}>
        <span className={`text-lg font-semibold ${getTextClass()}`}>
          {getMessage()}
        </span>
      </div>
    </div>
  );
}

export default RiskMeter;
