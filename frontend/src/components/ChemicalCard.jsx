import RiskBadge from './RiskBadge';

function ChemicalCard({ chemical, onClick }) {
  return (
    <div 
      onClick={() => onClick(chemical)}
      className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {chemical.chemical_name}
          </h3>
          {chemical.e_number && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400 font-mono">
              E{chemical.e_number}
            </span>
          )}
        </div>
        <RiskBadge level={chemical.risk_level} size="small" />
      </div>

      {/* Category Tag */}
      {chemical.category && (
        <div className="mb-3">
          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg">
            {chemical.category}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-slate-400 line-clamp-2 mb-4">
        {chemical.health_concerns || chemical.purpose || 'No description available.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-xs text-slate-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click for details
        </span>
        <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default ChemicalCard;
