import { useState } from 'react';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function Layout({ children, hideSidebar = false }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme();

  // Unified dark theme with layered backgrounds
  const darkBgClass = 'bg-[#0B1220]';
  const lightBgClass = 'bg-white';

  if (hideSidebar) {
    return (
      <div 
        className={`min-h-screen ${theme === 'dark' ? darkBgClass : lightBgClass} overflow-y-auto transition-colors duration-300`}
        data-theme={theme}
      >
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {/* Background gradient effect for dark mode */}
        {theme === 'dark' && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${theme === 'dark' ? darkBgClass : lightBgClass} overflow-y-auto transition-colors duration-300`}
      data-theme={theme}
    >
      {/* Background gradient effect for dark mode */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
