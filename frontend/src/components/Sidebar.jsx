import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();

  // Check if we're in personal care mode
  const isPersonalCare = location.pathname.startsWith('/personal-care');

  // Consistent dark theme colors
  const sidebarBg = theme === 'dark'
    ? 'bg-[#0F172A]/90 border-[#374151]'
    : 'bg-white/80 border-slate-200';

  // Personal care theme colors
  const personalCareActiveColor = 'text-pink-500';
  const personalCareGlowColor = 'from-pink-500 to-purple-500';

  const textSecondary = theme === 'dark' ? 'text-[#D1D5DB]' : 'text-slate-500';
  const textMuted = theme === 'dark' ? 'text-[#9CA3AF]' : 'text-slate-400';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#1F2937]' : 'hover:bg-slate-100';
  const activeBg = theme === 'dark' ? 'bg-[#1F2937]' : 'bg-slate-100';
  const borderColor = theme === 'dark' ? 'border-[#374151]' : 'border-slate-200';

  const navItems = [
    { 
      path: '/home', 
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
      path: '/daily-tracker',
      label: 'Daily Tracker',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18m0 0l-4-4m4 4l4-4M5 7h14" />
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
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  // Personal Care navigation items
  const personalCareNavItems = [
    { 
      path: '/personal-care', 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: '/personal-care/analyze', 
      label: 'Analyze', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      path: '/personal-care/database', 
      label: 'Database', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    { 
      path: '/personal-care/guide', 
      label: 'Guide', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      path: '/personal-care/about', 
      label: 'About', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  // Choose which nav items to display
  const displayNavItems = isPersonalCare ? personalCareNavItems : navItems;
  const activeColor = isPersonalCare ? personalCareActiveColor : 'text-cyan-500';
  const glowColor = isPersonalCare ? personalCareGlowColor : 'from-cyan-500 to-purple-500';

  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`flex flex-col fixed left-0 top-[78px] h-[calc(100vh-78px)] ${sidebarBg} backdrop-blur-xl border-r ${borderColor} transition-all duration-300 z-40 overflow-visible`}
    >
      {/* AI Gradient Glow Background - Dark mode only */}
      {theme === 'dark' && (
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl opacity-40 animate-pulse"></div>
      )}
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
      <div className={`h-20 flex items-center px-4 border-b ${borderColor}`}>
        <Link to="/home" className="flex items-center gap-3 px-3 py-3 hover:scale-105 transition duration-300">
          <div className={`p-[2px] rounded-xl bg-gradient-to-r ${isPersonalCare ? 'from-pink-500 to-purple-500' : 'from-cyan-500 to-purple-500'}`}>
            <div className="bg-slate-900 rounded-xl p-2 flex items-center justify-center">
              <img
                src={logo}
                alt="BioGuard Logo"
                onError={(e) => e.target.style.display = 'none'}
                className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]"
              />
            </div>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-semibold text-white">
                BioGuard AI
              </h2>
              <p className="text-xs text-slate-400">
                AI Safety
              </p>
            </div>
          )}
        </Link>
      </div>

        {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4 flex-grow">
        {/* Section Label */}
        {!collapsed && (
          <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isPersonalCare ? 'text-pink-500' : 'text-cyan-500'}`}>
            {isPersonalCare ? '🧴 Personal Care' : '🍎 Food Analysis'}
          </div>
        )}
        {displayNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex items-center px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${hoverBg} hover:translate-x-1 ${
              isActive(item.path) 
                ? `${activeBg} ${isPersonalCare ? 'bg-pink-500/10' : activeBg}` 
                : `${textMuted} hover:text-slate-700 dark:hover:text-white`
            }`}
          >
            {isActive(item.path) && (
              <span className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${glowColor} rounded-r-full shadow-[0_0_12px_rgba(236,72,153,0.8)]`}></span>
            )}
            <span className={`${isActive(item.path) ? activeColor : textMuted} transition-colors`}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
        
        {/* Mode Switch */}
        <Link
          to={isPersonalCare ? '/home' : '/personal-care'}
          className={`relative flex items-center px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
            isPersonalCare 
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30' 
              : 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 border border-pink-500/30'
          }`}
        >
          <span className={isPersonalCare ? 'text-cyan-400' : 'text-pink-400'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </span>
          {!collapsed && (
            <span className="text-sm font-medium">
              {isPersonalCare ? '🍎 Switch to Food' : '🧴 Switch to Personal Care'}
            </span>
          )}
        </Link>
      </nav>

        {/* Bottom Section - Stats & Theme Toggle */}
      {!collapsed && (
        <div className="p-4">
          <div className={`p-6 rounded-xl backdrop-blur-xl border ${borderColor} ${
            theme === 'dark' 
              ? 'bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:border-cyan-400/40' 
              : 'bg-slate-50 shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:border-cyan-400/40'
          } transition duration-300 hover:scale-[1.03]`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${textSecondary} text-sm`}>Database Status</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div className="text-3xl font-bold text-cyan-500">1000+</div>
            <div className={`${textSecondary} text-sm mt-1`}>Chemicals Analyzed</div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3 top-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-50 shadow-lg hover:scale-110 ${
          theme === 'dark'
            ? 'bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700'
            : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
        }`}
      >
        <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
    </aside>
  );
}

export default Sidebar;

