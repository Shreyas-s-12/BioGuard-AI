import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function PersonalCareAbout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';



  const features = [
    {
      icon: '🔬',
      title: 'Product Analysis',
      description: 'Scan or enter ingredients from cosmetics, skincare, and haircare products to identify harmful chemicals.'
    },
    {
      icon: '🧬',
      title: 'Chemical Database',
      description: 'Access comprehensive information about 100+ personal care chemicals, their risks, and effects.'
    },
    {
      icon: '👤',
      title: 'Personalized Recommendations',
      description: 'Get tailored advice based on your skin type (dry, oily, sensitive) and hair type.'
    },
    {
      icon: '💬',
      title: 'AI Assistant',
      description: 'Ask questions about product ingredients and get instant answers from our AI chatbot.'
    }
  ];

  const riskLevels = [
    {
      level: 'High Risk',
      color: 'bg-red-500',
      description: 'Chemicals that should be avoided - known carcinogens, endocrine disruptors, or toxic substances.'
    },
    {
      level: 'Moderate Risk',
      color: 'bg-yellow-500',
      description: 'Chemicals that may cause irritation or have potential health concerns with prolonged use.'
    },
    {
      level: 'Low Risk',
      color: 'bg-green-500',
      description: 'Generally safe ingredients that are well-tolerated by most skin types.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
            About Us
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Personal Care Analysis
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Advanced AI-powered analysis for your cosmetics and skincare products
          </p>
        </div>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <button
            onClick={() => navigate('/personal-care')}
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
              isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            ← Back to Personal Care
          </button>
          
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl mb-6 shadow-lg">
            ℹ️
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            About{' '}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Personal Care
            </span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Learn about our personal care product analysis platform and how it helps you make safer choices.
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mb-12 p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Levels Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`mb-12 p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Risk Levels Explained
          </h2>
          <div className="space-y-4">
            {riskLevels.map((risk, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 rounded-full ${risk.color}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {risk.level}
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {risk.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data Source */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Data Source
          </h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Our chemical database is compiled from research papers, regulatory databases, and safety assessments from organizations like the EWG (Environmental Working Group), FDA, and European Commission. We regularly update our database to ensure you have the most accurate information.
          </p>
        </motion.div>

        {/* Why It Matters */}
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
            ⚠️ Why It Matters
          </h2>
          <div className="space-y-4">
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Many personal care products contain chemicals that can have long-term effects on your health. 
              Unlike food, which is digested, products applied to your skin, hair, and nails are absorbed 
              directly into your body.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  📌 Cumulative Exposure
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Using multiple products daily adds up. A shampoo, conditioner, body wash, moisturizer, 
                  and makeup can mean dozens of chemical exposures every single day.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  📌 Hormone Disruption
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Certain chemicals like parabens and phthalates can interfere with your endocrine system, 
                  potentially affecting reproduction, metabolism, and development.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  📌 Skin Barrier Damage
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Harsh ingredients like sulfates can strip your skin's natural oils, leading to 
                  dryness, irritation, and premature aging over time.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  📌 Allergic Reactions
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Continuous exposure to certain ingredients can cause contact allergies that 
                  develop over time, even with products you've used for years.
                </p>
              </div>
            </div>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="font-semibold text-purple-400">The Solution:</span> Being informed about 
              what you put on your body empowers you to make safer choices. Our tool helps you 
              understand product ingredients and their potential effects, so you can choose 
              products that align with your health goals.
            </p>
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`p-6 rounded-2xl ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            🔍 How the System Works
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                1. Chemical Detection
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Our system scans ingredient lists against a comprehensive database of harmful 
                chemicals. It identifies both direct ingredients and their alternative names.
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                2. Risk Classification
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Each detected chemical is classified as <span className="text-red-400">High</span>, 
                <span className="text-yellow-400"> Moderate</span>, or <span className="text-green-400">Low</span> risk 
                based on scientific research and regulatory guidelines.
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                3. Personalization
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                By providing your skin type (dry, oily, sensitive, combination) and hair type, 
                we provide personalized recommendations tailored to your specific needs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
  );
}