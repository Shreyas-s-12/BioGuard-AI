import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function Guide() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Standardized Page Header */}
        <div className="page-header">
          <h1 className="page-title text-4xl">
            <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Food Safety Guide
            </span>
          </h1>
          <p className="page-subtitle">
            Learn how to understand food labels and make informed choices
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            Understanding Food Labels
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              Reading food labels is essential for making healthy choices. Manufacturers use a variety 
              of additives, preservatives, and alternative names to enhance flavor, extend shelf life, 
              and reduce costs. Understanding these ingredients helps you take control of your health.
            </p>
            <p>
              This guide will help you navigate common food additives, identify hidden sugars, and 
              learn how to read nutrition labels effectively.
            </p>
          </div>
        </section>

        {/* E-numbers and Additives */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            E-numbers and Food Additives
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              E-numbers are codes used in Europe to identify food additives. They start with "E" 
              followed by a number (e.g., E250, E621). While some are harmless or even beneficial, 
              others have been linked to health concerns.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Generally Safe
                </h3>
                <p className="text-sm text-slate-400">
                  E100 (Curcumin), E300 (Vitamin C), E330 (Citric acid) - These are natural or derived from natural sources.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Use in Moderation
                </h3>
                <p className="text-sm text-slate-400">
                  E250 (Sodium nitrite), E621 (MSG), E250 (Sodium nitrate) - May cause issues in high amounts.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  Limit Consumption
                </h3>
                <p className="text-sm text-slate-400">
                  E102 (Tartrazine), E122 (Carmoisine), E124 (Ponceau 4R) - Artificial colors linked to hyperactivity.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  Avoid When Possible
                </h3>
                <p className="text-sm text-slate-400">
                  E171 (Titanium dioxide), E150d (Caramel color IV) - Associated with potential health risks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hidden Sugars */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Hidden Sugars
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              Sugar goes by many names on food labels. Manufacturers use these alternative names to 
              make sugar content less obvious. Be on the lookout for these hidden sources:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Common Sugar Names</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Sucrose</li>
                  <li>• Glucose</li>
                  <li>• Fructose</li>
                  <li>• Maltose</li>
                  <li>• Dextrose</li>
                  <li>• Lactose</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Hidden Sugar Names</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• High fructose corn syrup</li>
                  <li>• Maltodextrin</li>
                  <li>• Agave nectar</li>
                  <li>• Rice syrup</li>
                  <li>• Cane juice</li>
                  <li>• Fruit juice concentrate</li>
                </ul>
              </div>
            </div>
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 mt-6">
              <p className="text-pink-300">
                <strong>Tip:</strong> The American Heart Association recommends no more than 6 teaspoons 
                (25g) of added sugar per day for women and 9 teaspoons (36g) for men.
              </p>
            </div>
          </div>
        </section>

        {/* Artificial Preservatives */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            Artificial Preservatives
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              Preservatives are added to food to prevent spoilage and extend shelf life. While they 
              can be useful, some artificial preservatives have raised health concerns.
            </p>
            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sodium Nitrate/Nitrite</h3>
                  <p className="text-sm text-slate-400">
                    Found in processed meats. Can form harmful compounds when cooked at high temperatures. 
                    Linked to increased cancer risk.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white">BHA and BHT</h3>
                  <p className="text-sm text-slate-400">
                    Butylated hydroxyanisole and butylated hydroxytoluene are common antioxidants. 
                    Studies show mixed results on their safety.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sodium Metabisulfite</h3>
                  <p className="text-sm text-slate-400">
                    Used in dried fruits and wine. Can cause allergic reactions in sensitive individuals, 
                    especially those with sulfite sensitivity.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-white">Potassium Sorbate</h3>
                  <p className="text-sm text-slate-400">
                    One of the most common preservatives. Generally considered safe but some studies 
                    suggest potential DNA effects at high concentrations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips for Reading Food Labels */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            Tips for Reading Food Labels
          </h2>
          <div className="text-slate-300 space-y-4">
            <p>
              Follow these practical tips to make better food choices:
            </p>
            <div className="grid gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-xl p-4 flex items-start">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">Check the Ingredient List First</h3>
                  <p className="text-sm text-slate-400">
                    Ingredients are listed in order by weight. If sugar or unhealthy fats are in the 
                    top 3 positions, the product is likely high in these ingredients.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 flex items-start">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white">Look for Added Sugars Line</h3>
                  <p className="text-sm text-slate-400">
                    The nutrition label now shows "Added Sugars" separately. This helps you distinguish 
                    between natural and added sugars.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 flex items-start">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white">Watch for Alternative Names</h3>
                  <p className="text-sm text-slate-400">
                    Learn the many names for sugar and additives. If you see words you can't 
                    pronounce, look them up.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 flex items-start">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-white">Check Serving Sizes</h3>
                  <p className="text-sm text-slate-400">
                    Nutrition information is based on the serving size listed. The entire package 
                    may contain multiple servings, so multiply accordingly.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 flex items-start">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 font-bold mr-4">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-white">Understand the Daily Values</h3>
                  <p className="text-sm text-slate-400">
                    % Daily Value shows how much a nutrient in one serving contributes to a 
                    daily diet. 5% or less is low, 20% or more is high.
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
              Use BioGuard AI to scan food labels and identify harmful additives.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
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

export default Guide;
