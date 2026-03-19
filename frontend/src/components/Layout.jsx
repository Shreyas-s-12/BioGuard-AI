import { useState } from 'react';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function Layout({ children, hideSidebar = false }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme();

  const bgGradient = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800'
    : 'bg-gradient-to-br from-white via-slate-50 to-white';

  if (hideSidebar) {
    return (
      <div className={`min-h-screen ${bgGradient} overflow-y-auto transition-colors duration-300`}>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient} overflow-y-auto transition-colors duration-300`}>
      {/* Background Effects - Dark mode only */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      )}
      
      <Sidebar />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-8 min-h-screen">
          <div className="fixed top-4 right-8 z-50">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
