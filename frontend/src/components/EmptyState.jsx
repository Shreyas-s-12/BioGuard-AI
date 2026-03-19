import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function EmptyState({ 
  icon = "📭",
  title = "No data yet",
  description = "Start by analyzing your first food item",
  actionLabel = "Start Analysis",
  actionPath = "/analyze"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Icon with glow effect */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-24 h-24 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
      >
        <span className="text-5xl">{icon}</span>
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-200 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && actionPath && (
        <Link
          to={actionPath}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
        >
          {actionLabel}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </motion.div>
  );
}

function EmptyStateCard({ title, icon, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 ${className}`}
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-200">
        <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-2">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

export default EmptyState;
export { EmptyStateCard };
