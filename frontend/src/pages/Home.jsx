import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

function Home() {
  return (
    <Layout>
      {/* Main Container */}
      <div className="min-h-screen bg-white">
        
        {/* Hero Section with Gradient Glow */}
        <section className="relative overflow-hidden py-16 sm:py-20">
          {/* Gradient Glow Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
              <div 
                className="w-full h-full" 
                style={{ 
                  background: 'radial-gradient(circle, rgba(79, 140, 255, 0.12) 0%, rgba(106, 168, 255, 0.05) 40%, transparent 70%)',
                  filter: 'blur(40px)'
                }}
              />
            </div>
          </div>

          {/* Content Container - Max 1100px */}
          <div className="max-w-[1100px] mx-auto px-6">
            
            {/* Hero Content */}
            <div className="text-center space-y-6">
              {/* Animated Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-4xl sm:text-5xl font-bold"
                style={{ color: '#0F172A' }}
              >
                NutriDetect AI
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                className="max-w-xl mx-auto text-base sm:text-lg"
                style={{ color: '#475569' }}
              >
                Advanced AI-powered food safety analysis that detects harmful additives, hidden sugars, and nutritional concerns in real-time.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="flex flex-wrap justify-center gap-4 pt-2"
              >
                {/* Primary Button - Start Analysis */}
                <Link
                  to="/analyze"
                  className="inline-flex items-center justify-center gap-2 font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #4F8CFF, #6AA8FF)',
                    boxShadow: '0 4px 12px rgba(79, 140, 255, 0.25)',
                    borderRadius: '12px',
                    padding: '12px 24px'
                  }}
                >
                  Start Analysis
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                {/* Secondary Button - Explore Database */}
                <Link
                  to="/chemicals"
                  className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: '#FFFFFF',
                    color: '#4F8CFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  Explore Database
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section - Alternate Background */}
        <section 
          className="py-16"
          style={{ background: '#F8FAFC' }}
        >
          {/* Features Container - Max 1100px */}
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* Feature Card 1 - Chemical Analysis */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white p-5 rounded-2xl"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#EEF4FF' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#4F8CFF" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ color: '#0F172A' }}
                >
                  Chemical Analysis
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#475569' }}
                >
                  Detect 1000+ harmful additives
                </p>
              </motion.div>
              
              {/* Feature Card 2 - Sugar Detection */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white p-5 rounded-2xl"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#F1F5F9' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#6AA8FF" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ color: '#0F172A' }}
                >
                  Sugar Detection
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#475569' }}
                >
                  Identify 100+ hidden sugar aliases
                </p>
              </motion.div>
              
              {/* Feature Card 3 - Lightning Fast */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white p-5 rounded-2xl"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#EEF4FF' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#4F8CFF" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ color: '#0F172A' }}
                >
                  Lightning Fast
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#475569' }}
                >
                  Results in under 5 seconds
                </p>
              </motion.div>
              
              {/* Feature Card 4 - High Accuracy */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white p-5 rounded-2xl"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#F1F5F9' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#6AA8FF" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 
                  className="font-semibold mb-1"
                  style={{ color: '#0F172A' }}
                >
                  High Accuracy
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#475569' }}
                >
                  99% precision rate
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section className="py-12 bg-white">
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-center"
            >
              <p 
                className="text-sm font-medium mb-6"
                style={{ color: '#475569' }}
              >
                Trusted by thousands of health-conscious users
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="#4F8CFF" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: '#0F172A' }}>1000+ Chemicals</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="#4F8CFF" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: '#0F172A' }}>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="#4F8CFF" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: '#0F172A' }}>AI-Powered</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Home;
