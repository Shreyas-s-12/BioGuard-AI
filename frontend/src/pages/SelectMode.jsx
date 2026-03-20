import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function SelectMode() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const modes = [
    {
      id: 'food',
      title: 'Food Analysis',
      description: 'Analyze food ingredients, additives, and nutritional value',
      icon: '🍔',
      color: 'from-orange-500 to-red-500',
      path: '/analyze',
      features: ['E-numbers & Additives', 'Nutritional Analysis', 'Health Conditions', 'Grocery Scanner']
    },
    {
      id: 'personal-care',
      title: 'Personal Care',
      description: 'Analyze cosmetics, skincare, and haircare products',
      icon: '🧴',
      color: 'from-purple-500 to-pink-500',
      path: '/personal-care',
      features: ['Chemical Scanner', 'Skin Compatibility', 'Hair Type Analysis', 'Product Database']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen px-4 py-12 transition-colors duration-300 ${
        isDark ? 'bg-[#050b1a]' : 'bg-slate-50'
      }`}
    >
      {/* Background effects */}
      {isDark && (
        <>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" 
          />
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" 
          />
        </>
      )}

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Choose Your{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              Analysis Mode
            </span>
          </h1>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Select a domain to analyze products for safety and compatibility
          </p>
        </motion.div>

        {/* Mode Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6"
        >
          {modes.map((mode) => (
            <motion.div
              key={mode.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(mode.path)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                isDark 
                  ? 'bg-slate-900/60 border border-slate-800 hover:border-slate-700' 
                  : 'bg-white border border-slate-200 hover:border-slate-300'
              } backdrop-blur-xl shadow-xl transition-all duration-300`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative p-8">
                {/* Icon */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-4xl mb-6 shadow-lg`}
                >
                  {mode.icon}
                </motion.div>

                {/* Title */}
                <h2 className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  {mode.title}
                </h2>

                {/* Description */}
                <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {mode.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-center gap-2 text-sm ${
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`mt-8 py-3 px-6 rounded-xl bg-gradient-to-r ${mode.color} text-white font-semibold text-center shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  Get Started →
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Back to Login */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('/login')}
            className={`text-sm ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-500 hover:text-slate-600'} transition-colors`}
          >
            ← Back to Login
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
