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
        // Semantic colors
        'safe': '#22c55e',
        'moderate': '#eab308',
        'high-risk': '#ef4444',
        
        // Brand colors
        'bioguard': {
          'primary': '#4F8CFF',
          'secondary': '#6AA8FF',
          'accent': '#8B5CF6'
        },
        
        // Dark theme specific
        dark: {
          'base': '#0B1220',      // Deepest - body
          'container': '#0F172A', // Main container
          'section': '#111827',   // Section
          'card': '#1F2937',      // Cards
          'border': '#374151',    // Borders
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
          '0%': { boxShadow: '0 0 20px rgba(79, 140, 255, 0.1)' },
          '100%': { boxShadow: '0 0 30px rgba(79, 140, 255, 0.25)' }
        }
      },
      
      // Custom box shadows for dark mode
      boxShadow: {
        'dark': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(79, 140, 255, 0.2)',
        'glow-lg': '0 0 30px rgba(79, 140, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
