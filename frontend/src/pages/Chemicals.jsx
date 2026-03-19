import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ChemicalCard from '../components/ChemicalCard';
import ChemicalModal from '../components/ChemicalModal';
import { getChemicals } from '../services/api';
import { useTheme } from '../context/ThemeContext';

function Chemicals() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [chemicals, setChemicals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedChemical, setSelectedChemical] = useState(null);

  // Fetch chemicals when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchChemicals();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRisk, filterCategory]);

  const fetchChemicals = async () => {
    setLoading(true);
    try {
      const data = await getChemicals(searchTerm, filterRisk, filterCategory, 100);
      setChemicals(data.chemicals || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load chemicals:', err);
      setChemicals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from current results
  const categories = [...new Set(chemicals.map(c => c.category).filter(Boolean))];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Database Active</span>
        </div>
        <h1 className="text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Chemical Database
          </span>
        </h1>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg`}>
          Explore {total || '1000+'} food additives and their health effects
        </p>
      </div>

      {/* Filters */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-8 ${
        isDark 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Search</label>
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, E-number..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition ${
                  isDark 
                    ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Risk Level</label>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition appearance-none pr-10 ${
                isDark 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} value="all">All Levels</option>
              <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} value="high">High Risk</option>
              <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} value="moderate">Moderate</option>
              <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} value="low">Low Risk</option>
              <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} value="minimal">Minimal Risk</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition appearance-none pr-10 ${
                isDark 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} value="all">All Categories</option>
              {categories.map(cat => (
                <option className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Showing <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{chemicals.length}</span> of <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{total}</span> chemicals
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading chemicals...</p>
          </div>
        </div>
      )}

      {/* Chemical Cards Grid */}
      {!loading && (
        <>
          {chemicals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chemicals.map((chemical, idx) => (
                <div 
                  key={idx} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <ChemicalCard 
                    chemical={chemical} 
                    onClick={setSelectedChemical} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-64 border rounded-2xl ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <svg className={`w-16 h-16 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg`}>No chemicals found</p>
              <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'} text-sm mt-1`}>Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}

      {/* Chemical Modal */}
      {selectedChemical && (
        <ChemicalModal 
          chemical={selectedChemical} 
          onClose={() => setSelectedChemical(null)} 
        />
      )}
    </Layout>
  );
}

export default Chemicals;
