import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ExposureScore from '../components/ExposureScore';

function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Layout>
      {/* Main Container */}
      <div className="min-h-screen bg-white dark:bg-gray-900">
        
        {/* Content Container */}
        <div className="p-6 pt-8 max-w-6xl mx-auto">
          
          {/* Small Title */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-cyan-500">
              Food Safety Analysis
            </h2>
          </motion.div>

          {/* Daily Exposure Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <ExposureScore showFullDetails={true} />
          </motion.div>

          {/* Features Section */}
          <section className="py-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* Feature Card 1 - Chemical Analysis */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md dark:shadow-none"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 dark:bg-blue-900/30"
                >
                  <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1 text-slate-900 dark:text-white"
                >
                  Chemical Analysis
                </h3>
                <p 
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  Detect 1000+ harmful additives
                </p>
              </motion.div>
              
              {/* Feature Card 2 - Sugar Detection */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md dark:shadow-none"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-slate-100 dark:bg-slate-700"
                >
                  <svg className="w-6 h-6 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1 text-slate-900 dark:text-white"
                >
                  Sugar Detection
                </h3>
                <p 
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  Identify 100+ hidden sugar aliases
                </p>
              </motion.div>
              
              {/* Feature Card 3 - Lightning Fast */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md dark:shadow-none"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 dark:bg-blue-900/30"
                >
                  <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1 text-slate-900 dark:text-white"
                >
                  Lightning Fast
                </h3>
                <p 
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  Results in under 5 seconds
                </p>
              </motion.div>
              
              {/* Feature Card 4 - High Accuracy */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md dark:shadow-none"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-slate-100 dark:bg-slate-700"
                >
                  <svg className="w-6 h-6 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1 text-slate-900 dark:text-white"
                >
                  High Accuracy
                </h3>
                <p 
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
                  99% precision rate
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* Trust Indicators Section */}
          <section className="py-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <p 
                className="text-sm font-medium mb-6 text-slate-600 dark:text-slate-400"
              >
                Trusted by thousands of health-conscious users
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">1000+ Chemicals</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">AI-Powered</span>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
