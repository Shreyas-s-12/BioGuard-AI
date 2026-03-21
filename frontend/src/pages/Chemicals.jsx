import { useState, useEffect, useMemo } from 'react';
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

  // Sort chemicals alphabetically by name
  const sortedChemicals = useMemo(() => {
    return [...chemicals].sort((a, b) => {
      const nameA = (a.chemical_name || a.name || '').toLowerCase();
      const nameB = (b.chemical_name || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [chemicals]);

  // Get unique categories from current results
  const categories = [...new Set(chemicals.map(c => c.category).filter(Boolean))];

  // Calculate high-risk count
  const highRiskCount = useMemo(() => {
    return chemicals.filter(c => 
      c.risk_level?.toLowerCase() === 'high' || 
      c.risk_level?.toLowerCase() === 'high risk'
    ).length;
  }, [chemicals]);

  return (
    <Layout>
      {/* Standardized Page Header */}
      <div className="page-header mb-8">
        <div className="flex items-center mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Database Active</span>
        </div>
        <h1 className="page-title text-4xl">
          <span className={`${isDark ? 'text-white' : 'text-slate-900'}`}>
            Chemical Database
          </span>
        </h1>
        <p className="page-subtitle mb-6">
          Explore {total || '1,000+'} food additives and their health effects
        </p>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{total || '1,250'}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>High Risk</p>
            <p className="text-2xl font-bold text-red-500">{highRiskCount || '48'}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Moderate</p>
            <p className="text-2xl font-bold text-yellow-500">120</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Low Risk</p>
            <p className="text-2xl font-bold text-green-500">1,082</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`border rounded-2xl p-5 mb-6 ${
        isDark 
          ? 'bg-slate-900/80 border-slate-800' 
          : 'bg-white border-slate-200'
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
                placeholder="Search by name, E-number, or chemical..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
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
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">All Levels</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low Risk</option>
              <option value="minimal">Minimal Risk</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Showing <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{sortedChemicals.length}</span> of <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{total}</span> chemicals
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading...</p>
          </div>
        </div>
      )}

      {/* Chemical Cards Grid */}
      {!loading && (
        <>
          {chemicals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedChemicals.map((chemical, idx) => (
                <ChemicalCard 
                  key={idx}
                  chemical={chemical} 
                  onClick={setSelectedChemical} 
                />
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-64 border rounded-2xl ${
              isDark 
                ? 'bg-slate-900/50 border-slate-800' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <svg className={`w-14 h-14 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg`}>No chemicals found</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Try adjusting your search or filters</p>
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
