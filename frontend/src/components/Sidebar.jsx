import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: '/analyze', 
      label: 'Analyze Food', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      path: '/compare', 
      label: 'Compare Foods', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      path: '/chemicals', 
      label: 'Chemical Database', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    { 
      path: '/guide', 
      label: 'Food Safety Guide', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      path: '/about', 
      label: 'About', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`flex flex-col fixed left-0 top-0 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 overflow-hidden ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* AI Gradient Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl opacity-40 animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
      <div className="h-20 flex items-center px-4 border-b border-white/10">
        <Link to="/" className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur border border-cyan-500/20">
            <img
              src={logo}
              alt="NutriDetect AI Logo"
              className="w-9 h-9 transition duration-300 transform hover:scale-110 
              drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]
              hover:drop-shadow-[0_0_20px_rgba(34,211,238,1)]"
            />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NutriDetect
              </h1>
              <p className="text-xs text-slate-400">AI Food Safety</p>
            </div>
          )}
        </Link>
      </div>

        {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex items-center px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
              isActive(item.path) 
                ? 'bg-slate-800 text-cyan-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isActive(item.path) && (
              <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"></span>
            )}
            <span className={`${isActive(item.path) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

        {/* Bottom Section - Stats */}
      {!collapsed && (
        <div className="p-4">
          <div className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:border-cyan-400/40 transition duration-300 hover:scale-[1.03]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Database Status</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div className="text-3xl font-bold text-cyan-400">1000+</div>
            <div className="text-slate-400 text-sm mt-1">Chemicals Analyzed</div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition z-50"
      >
        <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
    </aside>
  );
}

export default Sidebar;
