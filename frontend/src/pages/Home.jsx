import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {
  const features = [
    {
      icon: '📷',
      title: 'Upload Food Labels',
      description: 'Simply snap or upload a photo of any food label and let our AI analyze it instantly.'
    },
    {
      icon: '🔬',
      title: 'Chemical Detection',
      description: 'Our AI identifies 300+ harmful additives, preservatives, and artificial ingredients.'
    },
    {
      icon: '🍬',
      title: 'Hidden Sugar Tracker',
      description: 'Detect over 100 different names for hidden sugars that manufacturers use.'
    },
    {
      icon: '💡',
      title: 'Health Recommendations',
      description: 'Get personalized advice based on the detected ingredients and nutritional values.'
    }
  ];

  const steps = [
    {
      step: 1,
      icon: '📸',
      title: 'Upload Image',
      description: 'Take a photo of the food label or upload an existing image'
    },
    {
      step: 2,
      icon: '🤖',
      title: 'AI Analysis',
      description: 'Our AI scans for harmful chemicals, hidden sugars, and nutrition concerns'
    },
    {
      step: 3,
      icon: '📊',
      title: 'Get Results',
      description: 'Receive a comprehensive health risk score and detailed breakdown'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-nutri-primary/20 text-nutri-primary rounded-full text-sm mb-6">
              🔬 AI-Powered Food Safety Analysis
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">NutriGuard AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Make informed choices about what you eat. Our AI-powered platform analyzes food labels 
              to detect harmful additives, hidden sugars, and nutritional concerns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/analyze"
                className="px-8 py-4 bg-gradient-to-r from-nutri-primary to-nutri-secondary text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center"
              >
                <span>Start Analysis</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/chemicals"
                className="px-8 py-4 bg-slate-700/50 text-white font-semibold rounded-xl hover:bg-slate-700 transition flex items-center justify-center"
              >
                <span>View Database</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-nutri-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-nutri-accent/20 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">300+</div>
              <div className="text-slate-400">Chemical Additives</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">100+</div>
              <div className="text-slate-400">Sugar Aliases</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">5s</div>
              <div className="text-slate-400">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">99%</div>
              <div className="text-slate-400">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Get detailed food safety analysis in three simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="glass rounded-2xl p-8 text-center card-hover">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-nutri-primary to-nutri-secondary rounded-2xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="text-sm text-nutri-primary font-semibold mb-2">Step {item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-slate-400 text-lg">Everything you need to make healthier food choices</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass rounded-2xl p-6 flex items-start space-x-4 card-hover">
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Analyze Your Food?</h2>
            <p className="text-slate-400 text-lg mb-8">
              Start making informed decisions about what you and your family eat.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-nutri-primary to-nutri-secondary text-white font-semibold rounded-xl hover:opacity-90 transition"
            >
              <span>Get Started Now</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-700">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>© 2024 NutriGuard AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
