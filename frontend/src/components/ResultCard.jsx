import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function ResultCard({ title, icon, children, className = '' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className={`border rounded-2xl p-6 ${className} transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 hover:border-blue-400 hover:shadow-lg' 
          : 'bg-white border-[#E5E7EB] hover:border-[#4F8CFF] hover:shadow-lg'
      }`}
      style={!isDark ? { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' } : {}}
    >
      <h2 className={`text-xl font-semibold mb-4 flex items-center ${
        isDark ? 'text-slate-200' : 'text-[#0F172A]'
      }`}>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 ${
          isDark 
            ? 'bg-blue-500/20' 
            : 'bg-[#EEF4FF]'
        }`}>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function ChemicalCard({ chemical }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': 
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      case 'moderate': 
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'low': 
        return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };
      default: 
        return { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' };
    }
  };

  const colors = getRiskColor(chemical.risk_level);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`border rounded-2xl transition-all p-4 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 shadow-lg' 
          : 'bg-white border-[#E5E7EB] shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            {chemical.chemical_name}
          </h3>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
            {chemical.e_number}
          </span>
        </div>
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: colors.bg, 
            color: colors.text 
          }}
        >
          {chemical.risk_level}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <p className={isDark ? 'text-slate-300' : 'text-[#475569]'}>
          <span className={isDark ? 'text-slate-400' : 'text-[#475569]'}>Category:</span> {chemical.category}
        </p>
        <p className={isDark ? 'text-slate-300' : 'text-[#475569]'}>
          <span className={isDark ? 'text-slate-400' : 'text-[#475569]'}>Purpose:</span> {chemical.purpose}
        </p>
        {chemical.health_concerns && (
          <p className={isDark ? 'text-slate-300' : 'text-[#475569]'}>
            <span className={isDark ? 'text-slate-400' : 'text-[#475569]'}>Concerns:</span> {chemical.health_concerns}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ChemicalsList({ chemicals }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!chemicals || chemicals.length === 0) {
    return (
      <ResultCard title="Detected Chemicals" icon="✅">
        <div className="text-center py-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#DCFCE7] flex items-center justify-center"
          >
            <span className="text-3xl">✅</span>
          </motion.div>
          <p className={isDark ? 'text-slate-400' : 'text-[#475569]'}>No harmful chemicals detected!</p>
        </div>
      </ResultCard>
    );
  }

  return (
    <ResultCard title={`Detected Chemicals (${chemicals.length})`} icon="🧪">
      <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
        {chemicals.map((chem, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="chemical-tag"
          >
            <ChemicalCard chemical={chem} />
          </motion.div>
        ))}
      </div>
    </ResultCard>
  );
}

function HiddenSugars({ sugars }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!sugars || sugars.length === 0) {
    return (
      <ResultCard title="Hidden Sugars" icon="🍬">
        <div className="text-center py-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#DCFCE7] flex items-center justify-center"
          >
            <span className="text-3xl">✅</span>
          </motion.div>
          <p className={isDark ? 'text-slate-400' : 'text-[#475569]'}>No hidden sugars detected!</p>
        </div>
      </ResultCard>
    );
  }

  return (
    <ResultCard title={`Hidden Sugars (${sugars.length})`} icon="🍬">
      <div className="space-y-2">
        {sugars.map((sugar, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-2 rounded-lg"
            style={{ 
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA'
            }}
          >
            <span className="text-sm font-medium" style={{ color: '#DC2626' }}>{sugar}</span>
            <span className="text-xs" style={{ color: '#B91C1C' }}>Hidden Sugar</span>
          </motion.div>
        ))}
      </div>
    </ResultCard>
  );
}

export default ResultCard;
export { ChemicalCard, ChemicalsList, HiddenSugars };
