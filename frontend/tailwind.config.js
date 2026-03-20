/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Risk colors
        'risk': {
          'high': '#ef4444',
          'moderate': '#f59e0b',
          'low': '#22c55e',
        },
        
        // Brand colors
        'bioguard': {
          'primary': '#3b82f6',
          'secondary': '#6366f1',
          'accent': '#6366f1'
        },
        
        // Dark theme - Premium layered backgrounds
        dark: {
          'base': '#020617',        // Main background - deepest
          'container': '#0f172a',   // Secondary background
          'section': '#0f172a',     // Section
          'card': '#1e293b',        // Cards
          'hover': '#334155',       // Hover states
          'border': '#334155',      // Borders
        },
        
        light: {
          'base': '#FFFFFF',
          'container': '#F8FAFC',
          'section': '#F1F5F9',
          'card': '#FFFFFF',
          'border': '#E5E7EB',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.25)' }
        }
      },
      
      // Custom box shadows for dark mode
      boxShadow: {
        'dark': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.2)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-accent': '0 0 20px rgba(99, 102, 241, 0.2)',
      }
    },
  },
  plugins: [],
}
