import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Standardized Page Header */}
        <div className="page-header">
          <h1 className="page-title text-4xl">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About BioGuard AI
            </span>
          </h1>
          <p className="page-subtitle">
            Empowering consumers with food safety intelligence
          </p>
        </div>

        {/* What is BioGuard AI */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            What is BioGuard AI?
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              BioGuard AI is an intelligent food safety platform that helps consumers make 
              informed decisions about the food they eat. Using advanced artificial intelligence 
              and machine learning algorithms, we analyze food labels to identify harmful 
              additives, hidden sugars, and nutritional concerns.
            </p>
            <p>
              Our mission is to democratize food safety information and empower people to take 
              control of their health by understanding what's really in their food.
            </p>
          </div>
        </section>

        {/* Why Food Safety Matters */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            Why Food Safety Awareness Matters
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              Modern food production relies heavily on processed ingredients and artificial 
              additives to enhance flavor, extend shelf life, and reduce costs. While some 
              additives are considered safe, others have been linked to various health concerns.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Rising Health Issues
                </h3>
                <p className="text-sm text-slate-400">
                  Processed food consumption is linked to obesity heart disease.
               , diabetes, and </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Hidden Ingredients
                </h3>
                <p className="text-sm text-slate-400">
                  Manufacturers use over 100 different names for sugar and thousands of additives.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Sensitive Populations
                </h3>
                <p className="text-sm text-slate-400">
                  Children, pregnant women, and people with allergies are particularly vulnerable.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Right to Know
                </h3>
                <p className="text-sm text-slate-400">
                  Consumers deserve clear information about what's in their food.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How AI Analyzes Food */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            How AI Analyzes Food Ingredients
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              Our AI-powered analysis system uses multiple techniques to evaluate food safety:
            </p>
            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ingredient Parsing</h3>
                  <p className="text-sm text-slate-400">
                    Text is parsed and individual ingredients are extracted and categorized.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white">Chemical Database Matching</h3>
                  <p className="text-sm text-slate-400">
                    Extracted ingredients are matched against our database of 1000+ additives 
                    to identify potential concerns.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sugar Alias Detection</h3>
                  <p className="text-sm text-slate-400">
                    Our system recognizes 100+ different names for hidden sugars that 
                    manufacturers use to disguise sugar content.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-white">Nutritional Analysis</h3>
                  <p className="text-sm text-slate-400">
                    Nutrition values are evaluated against daily recommended limits to 
                    identify potential health concerns.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-white">Risk Scoring</h3>
                  <p className="text-sm text-slate-400">
                    All findings are combined into a comprehensive health risk score 
                    with personalized recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Analyze Your Food?</h2>
            <p className="text-slate-400 mb-6">
              Start making informed decisions about what you eat.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Analysis
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default About;
