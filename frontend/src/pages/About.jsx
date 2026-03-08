import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">About NutriGuard AI</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Empowering consumers with food safety intelligence
          </p>
        </div>

        {/* What is NutriGuard AI */}
        <section className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-10 h-10 bg-nutri-primary/20 rounded-xl flex items-center justify-center mr-3 text-2xl">
              🔬
            </span>
            What is NutriGuard AI?
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              NutriGuard AI is an intelligent food safety platform that helps consumers make 
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
        <section className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-10 h-10 bg-nutri-secondary/20 rounded-xl flex items-center justify-center mr-3 text-2xl">
              ⚠️
            </span>
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
                <h3 className="font-semibold text-white mb-2">📈 Rising Health Issues</h3>
                <p className="text-sm text-slate-400">
                  Processed food consumption is linked to obesity, diabetes, and heart disease.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">🔍 Hidden Ingredients</h3>
                <p className="text-sm text-slate-400">
                  Manufacturers use over 100 different names for sugar and thousands of additives.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">👶 Sensitive Populations</h3>
                <p className="text-sm text-slate-400">
                  Children, pregnant women, and people with allergies are particularly vulnerable.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">📢 Right to Know</h3>
                <p className="text-sm text-slate-400">
                  Consumers deserve clear information about what's in their food.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How AI Analyzes Food */}
        <section className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="w-10 h-10 bg-nutri-accent/20 rounded-xl flex items-center justify-center mr-3 text-2xl">
              🤖
            </span>
            How AI Analyzes Food Ingredients
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              Our AI-powered analysis system uses multiple techniques to evaluate food safety:
            </p>
            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-nutri-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-nutri-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">Optical Character Recognition (OCR)</h3>
                  <p className="text-sm text-slate-400">
                    When you upload a food label image, our AI reads and extracts the text 
                    using advanced computer vision.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-nutri-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-nutri-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white">Chemical Database Matching</h3>
                  <p className="text-sm text-slate-400">
                    Extracted ingredients are matched against our database of 300+ additives 
                    to identify potential concerns.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-nutri-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-nutri-primary font-bold">
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
                <div className="w-8 h-8 bg-nutri-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-nutri-primary font-bold">
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
                <div className="w-8 h-8 bg-nutri-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-nutri-primary font-bold">
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
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Analyze Your Food?</h2>
            <p className="text-slate-400 mb-6">
              Start making informed decisions about what you eat.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-nutri-primary to-nutri-secondary text-white font-semibold rounded-xl hover:opacity-90 transition"
            >
              <span>Start Analysis</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;
