import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function RiskMeter({ score, showLabel = true, size = 'default' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getColor = () => {
    if (score >= 70) return '#DC2626'; // Red
    if (score >= 40) return '#D97706'; // Amber
    return '#16A34A'; // Green
  };

  const getLabel = () => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  const getBgColor = () => {
    if (score >= 70) return '#FEE2E2';
    if (score >= 40) return '#FEF3C7';
    return '#DCFCE7';
  };

  const sizeClasses = size === 'small' 
    ? 'h-2' 
    : size === 'large' 
    ? 'h-4' 
    : 'h-3';

  // Generate the filled portion of the bar
  const filledBlocks = Math.floor(score / 10);
  const emptyBlocks = 10 - filledBlocks;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
            Health Risk Score
          </span>
          <motion.span 
            key={getLabel()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm font-bold"
            style={{ color: getColor() }}
          >
            {getLabel()}
          </motion.span>
        </div>
      )}
      
      {/* Progress Bar Style */}
      <div className={`w-full ${sizeClasses} rounded-full overflow-hidden ${
        isDark ? 'bg-slate-700/50' : 'bg-[#E5E7EB]'
      }`}>
        <motion.div 
          className="h-full rounded-full"
          style={{ 
            backgroundColor: getColor(),
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* ASCII-style indicator */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-0.5">
          {[...Array(10)].map((_, i) => (
            <motion.span 
              key={i} 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              className="w-2 h-4 transition-colors"
              style={{ 
                backgroundColor: i < filledBlocks ? getColor() : (isDark ? '#334155' : '#E5E7EB'),
                borderRadius: i === 0 ? '4px 0 0 4px' : i === 9 ? '0 4px 4px 0' : '2px' 
              }}
            />
          ))}
        </div>
        <motion.span 
          key={score}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold"
          style={{ color: getColor() }}
        >
          {score}%
        </motion.span>
      </div>
    </div>
  );
}

export default RiskMeter;
