import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function PersonalCareGuide() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';



  const harmfulChemicals = [
    {
      name: 'SLS (Sodium Lauryl Sulfate)',
      concern: 'Causes dryness and irritation',
      icon: '🧪'
    },
    {
      name: 'Parabens',
      concern: 'Hormone disruption concerns',
      icon: '⚠️'
    },
    {
      name: 'Formaldehyde Releasers',
      concern: 'Skin irritation and potential carcinogens',
      icon: '☠️'
    },
    {
      name: 'Phthalates',
      concern: 'Endocrine disruption',
      icon: '🔴'
    },
    {
      name: 'Triclosan',
      concern: 'Antibiotic resistance concerns',
      icon: '🦠'
    },
    {
      name: 'Synthetic Fragrances',
      concern: 'Allergies and respiratory issues',
      icon: '💨'
    }
  ];

  const skinTypeTips = [
    {
      type: 'Dry Skin',
      avoid: 'Sulfates, Alcohol, Fragrance',
      recommend: 'Gentle, hydrating ingredients',
      icon: '🏜️'
    },
    {
      type: 'Oily Skin',
      avoid: 'Heavy silicones, Occlusive oils',
      recommend: 'Lightweight, non-comedogenic products',
      icon: '💧'
    },
    {
      type: 'Sensitive Skin',
      avoid: 'Fragrance, Essential oils, Dyes',
      recommend: 'Hypoallergenic, minimal ingredients',
      icon: '🌸'
    },
    {
      type: 'Combination Skin',
      avoid: 'Harsh sulfates, Heavy creams',
      recommend: 'Balanced, lightweight formulas',
      icon: '⚖️'
    }
  ];

  const safeAlternatives = [
    {
      category: 'Sulfate-Free',
      description: 'Products using gentler cleansing agents like coconut-based surfactants',
      examples: 'Cocamidopropyl betaine, Decyl glucoside'
    },
    {
      category: 'Paraben-Free',
      description: 'Preservatives like phenoxyethanol or ethylhexylglycerin',
      examples: 'Phenoxyethanol, Sodium benzoate'
    },
    {
      category: 'Fragrance-Free',
      description: 'Products without synthetic or natural fragrances',
      examples: 'Unscented, Essential oil-free'
    },
    {
      category: 'Natural Ingredients',
      description: 'Plant-based and organic ingredients',
      examples: 'Aloe vera, Shea butter, Jojoba oil'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
            Safety Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Personal Care{' '}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Safety Guide
            </span>
          </h1>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Learn how to identify harmful ingredients and make safer choices
          </p>
        </motion.div>

        {/* Common Harmful Chemicals */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            🔬 Common Harmful Chemicals
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {harmfulChemicals.map((chemical, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{chemical.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}>
                      {chemical.name}
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {chemical.concern}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How to Read Labels */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            📝 How to Read Labels
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-slate-800/50' : 'bg-slate-50'
            }`}>
              <h3 className={`font-semibold text-lg mb-2 ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                1. Ingredients Listed in Descending Order
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                The first ingredients are present in the highest amounts. If harmful chemicals appear near the top, 
                the product contains a significant amount of them.
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-slate-800/50' : 'bg-slate-50'
            }`}>
              <h3 className={`font-semibold text-lg mb-2 ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                2. Watch for Hidden Names
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Manufacturers use different names for harmful ingredients. For example, 
                "Fragrance" or "Parfum" can hide dozens of undisclosed chemicals.
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-slate-800/50' : 'bg-slate-50'
            }`}>
              <h3 className={`font-semibold text-lg mb-2 ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                3. Look for Certifications
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Certifications like "Organic," "Natural," or "Cruelty-Free" can help identify safer products, 
                though always verify the ingredient list yourself.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Skin Type Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            🧴 Skin Type Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {skinTypeTips.map((tip, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <h3 className={`font-semibold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    {tip.type}
                  </h3>
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <p className="mb-1">
                    <span className="font-medium text-red-400">Avoid:</span> {tip.avoid}
                  </p>
                  <p>
                    <span className="font-medium text-green-400">Recommend:</span> {tip.recommend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Safe Alternatives */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mb-8 p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            ✅ Safe Alternatives
          </h2>
          <div className="space-y-4">
            {safeAlternatives.map((alt, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}
              >
                <h3 className={`font-semibold text-lg mb-1 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  {alt.category}
                </h3>
                <p className={`text-sm mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {alt.description}
                </p>
                <p className={`text-xs ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  <span className="font-medium">Examples:</span> {alt.examples}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`p-6 rounded-2xl ${
            isDark 
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' 
              : 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            💡 Quick Tips
          </h2>
          <ul className={`space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Always patch test new products on a small area of skin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Check expiration dates - expired products can harbor bacteria</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Less is more - products with fewer ingredients are often safer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>When in doubt, consult a dermatologist</span>
            </li>
          </ul>
        </motion.div>
      </div>
  );
}
