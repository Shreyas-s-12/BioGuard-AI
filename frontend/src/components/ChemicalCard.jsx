import RiskBadge from './RiskBadge';
import { useTheme } from '../context/ThemeContext';

/**
 * ChemicalCard Component - Reusable across Food Safety and Personal Care pages
 * Features: Chemical name, Risk badge, Short description, View Details button
 */
function ChemicalCard({ chemical, onClick }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Map data fields based on source
  const chemicalName = chemical.chemical_name || chemical.name || '';
  const riskLevel = chemical.risk_level || chemical.risk || 'Unknown';
  const description = chemical.health_concerns || chemical.purpose || chemical.effects || chemical.description || '';
  const eNumber = chemical.e_number;

  return (
    <div 
      onClick={() => onClick(chemical)}
      className={`group border rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isDark 
          ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500' 
          : 'bg-white border-slate-200 hover:border-blue-500 shadow-md'
      }`}
      style={{ transition: 'all 0.25s ease' }}
    >
      {/* Header with Name and Risk Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2">
          <h3 className={`text-base font-bold leading-tight ${
            isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
          }`}>
            {chemicalName}
          </h3>
          {eNumber && (
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono ${
              isDark 
                ? 'bg-slate-700/60 text-slate-400' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              E{eNumber}
            </span>
          )}
        </div>
        <RiskBadge level={riskLevel} size="small" />
      </div>

      {/* Description */}
      <p className={`text-sm leading-relaxed line-clamp-2 mb-4 ${
        isDark ? 'text-slate-400' : 'text-slate-600'
      }`}>
        {description || 'No description available.'}
      </p>

      {/* View Details Button */}
      <button
        className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
          isDark 
            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <span>View Details</span>
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default ChemicalCard;
