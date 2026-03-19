import RiskBadge from './RiskBadge';
import { useTheme } from '../context/ThemeContext';

function ChemicalCard({ chemical, onClick }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      onClick={() => onClick(chemical)}
      className={`group border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isDark 
          ? 'bg-slate-900 border-slate-800 hover:border-blue-400' 
          : 'bg-white border-[#E5E7EB] hover:border-[#4F8CFF] shadow-md hover:shadow-lg'
      }`}
      style={!isDark ? { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' } : {}}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold transition-colors ${
            isDark ? 'text-white group-hover:text-blue-400' : 'text-[#0F172A] group-hover:text-[#4F8CFF]'
          }`}>
            {chemical.chemical_name}
          </h3>
          {chemical.e_number && (
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-mono ${
              isDark 
                ? 'bg-slate-700/50 text-slate-400' 
                : 'bg-[#F1F5F9] text-[#475569]'
            }`}>
              E{chemical.e_number}
            </span>
          )}
        </div>
        <RiskBadge level={chemical.risk_level} size="small" />
      </div>

      {/* Category Tag */}
      {chemical.category && (
        <div className="mb-3">
          <span className={`text-xs px-2 py-1 rounded-lg ${
            isDark 
              ? 'bg-purple-500/20 text-purple-400' 
              : 'bg-[#EEF4FF] text-[#4F8CFF]'
          }`}>
            {chemical.category}
          </span>
        </div>
      )}

      {/* Description */}
      <p className={`text-sm line-clamp-2 mb-4 ${
        isDark ? 'text-slate-400' : 'text-[#475569]'
      }`}>
        {chemical.health_concerns || chemical.purpose || 'No description available.'}
      </p>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-4 border-t ${
        isDark ? 'border-white/10' : 'border-[#E5E7EB]'
      }`}>
        <span className={`text-xs flex items-center ${
          isDark ? 'text-slate-500' : 'text-[#475569]'
        }`}>
          <svg className={`w-4 h-4 mr-1 ${isDark ? 'text-slate-500' : 'text-[#475569]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click for details
        </span>
        <span className={`transition-opacity ${isDark ? 'text-blue-400' : 'text-[#4F8CFF]'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default ChemicalCard;
