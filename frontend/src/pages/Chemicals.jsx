import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getChemicals } from '../services/api';

function Chemicals() {
  const [chemicals, setChemicals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch chemicals when filters change
  useEffect(() => {
    fetchChemicals();
  }, [searchTerm, filterRisk, filterCategory]);

  const fetchChemicals = async () => {
    setLoading(true);
    try {
      // Pass the filter values to backend
      const data = await getChemicals(searchTerm, filterRisk, filterCategory, 100);
      // Backend returns { total: X, chemicals: [...] }
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

  // Note: Filtering is now done on the backend, no client-side filtering needed

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-high-risk bg-high-risk/20';
      case 'moderate': return 'text-moderate bg-moderate/20';
      case 'low': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-slate-400 bg-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="spinner w-12 h-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Chemical Database</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Explore {chemicals.length}+ food additives and their health effects
          </p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, E-number, or alias..."
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition"
              />
            </div>

            {/* Risk Level Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Risk Level</label>
                <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition"
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
              <label className="block text-sm font-medium mb-2 text-slate-300">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-nutri-primary focus:ring-1 focus:ring-nutri-primary outline-none transition"
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
        <div className="mb-4 text-slate-400">
          Showing {chemicals.length} of {total} chemicals
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Chemical Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">E-Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Risk Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {chemicals.map((chem, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{chem.chemical_name}</div>
                      {chem.health_concerns && (
                        <div className="text-xs text-slate-400 mt-1">{chem.health_concerns}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{chem.e_number || '-'}</td>
                    <td className="px-6 py-4 text-slate-300">{chem.category || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(chem.risk_level)}`}>
                        {chem.risk_level || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{chem.purpose || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {chemicals.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-400">
              No chemicals found matching your criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Chemicals;
