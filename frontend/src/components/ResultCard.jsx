function ResultCard({ title, icon, children, className = '' }) {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-nutri-primary/20 rounded-lg flex items-center justify-center mr-2">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ChemicalCard({ chemical }) {
  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-high-risk bg-high-risk/20';
      case 'moderate': return 'text-moderate bg-moderate/20';
      case 'low': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-safe bg-safe/20';
    }
  };

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
      </div>
    </div>
  );
}

function ChemicalsList({ chemicals }) {
  if (!chemicals || chemicals.length === 0) {
    return (
      <ResultCard title="Detected Chemicals" icon="✅">
        <p className="text-slate-400 text-center py-4">No harmful chemicals detected!</p>
      </ResultCard>
    );
  }

  return (
    <ResultCard title={`Detected Chemicals (${chemicals.length})`} icon="🧪">
      <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
        {chemicals.map((chem, idx) => (
          <div key={idx} className="chemical-tag" style={{ animationDelay: `${idx * 0.1}s` }}>
            <ChemicalCard chemical={chem} />
          </div>
        ))}
      </div>
    </ResultCard>
  );
}

function HiddenSugars({ sugars }) {
  if (!sugars || sugars.length === 0) {
    return (
      <ResultCard title="Hidden Sugars" icon="🍬">
        <p className="text-slate-400 text-center py-4">No hidden sugars detected!</p>
      </ResultCard>
    );
  }

  return (
    <ResultCard title={`Hidden Sugars Detected (${sugars.length})`} icon="🍬">
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
    </ResultCard>
  );
}

function NutritionIssues({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <ResultCard title="Nutrition Analysis" icon="🥗">
        <p className="text-slate-400 text-center py-4">No nutrition concerns detected!</p>
      </ResultCard>
    );
  }

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-high-risk bg-high-risk/20 border-high-risk/30';
      case 'moderate': return 'text-moderate bg-moderate/20 border-moderate/30';
      default: return 'text-safe bg-safe/20 border-safe/30';
    }
  };

  return (
    <ResultCard title={`Nutrition Concerns (${issues.length})`} icon="🥗">
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
    </ResultCard>
  );
}

function RiskBreakdown({ scores }) {
  const items = [
    { label: 'Sugar Risk', value: scores.sugar_risk_score, color: 'bg-pink-500' },
    { label: 'Fat Risk', value: scores.fat_risk_score, color: 'bg-orange-500' },
    { label: 'Sodium Risk', value: scores.sodium_risk_score, color: 'bg-purple-500' },
    { label: 'Chemical Risk', value: scores.chemical_risk_score, color: 'bg-red-500' }
  ];

  return (
    <ResultCard title="Risk Breakdown" icon="📊">
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
    </ResultCard>
  );
}

function Recommendations({ recommendation, processingLevel }) {
  return (
    <ResultCard title="Recommendations" icon="💡">
      <div className="space-y-4">
        {recommendation && (
          <p className="text-slate-300">{recommendation}</p>
        )}
        {processingLevel && (
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Processing Level:</span>
            <span className="px-3 py-1 bg-nutri-secondary/20 text-nutri-secondary rounded-full text-sm">
              {processingLevel}
            </span>
          </div>
        )}
      </div>
    </ResultCard>
  );
}

export { ResultCard, ChemicalCard, ChemicalsList, HiddenSugars, NutritionIssues, RiskBreakdown, Recommendations };
export default ResultCard;
