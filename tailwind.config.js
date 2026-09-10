/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          // Apple HIG Light Theme System Colors
          bg: '#F2F2F7',               // systemGroupedBackground
          card: '#FFFFFF',             // secondarySystemGroupedBackground
          cardSubtle: '#F9F9FB',       // subtle elevated
          border: '#E5E5EA',           // systemGray5
          separator: '#C6C6C8',        // separator line (0.5px)
          
          // Apple System Colors
          blue: '#007AFF',
          green: '#34C759',
          indigo: '#5856D6',
          orange: '#FF9500',
          pink: '#FF2D55',
          purple: '#AF52DE',
          red: '#FF3B30',
          teal: '#30B0C7',
          yellow: '#FFCC00',
          
          // Grays
          gray1: '#8E8E93',
          gray2: '#AEAEB2',
          gray3: '#C7C7CC',
          gray4: '#D1D1D6',
          gray5: '#E5E5EA',
          gray6: '#F2F2F7',
          
          // Text Labels (Light)
          label: '#000000',
          secondaryLabel: 'rgba(60, 60, 67, 0.60)',
          tertiaryLabel: 'rgba(60, 60, 67, 0.30)',
          quaternaryLabel: 'rgba(60, 60, 67, 0.18)',
        }
      },
      fontFamily: {
        sans: ['"SF Pro Text"', '"Ploni"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['"SF Pro Display"', '"Ploni"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'ios': '14px',
        'ios-card': '20px',
        'ios-pill': '9999px',
      },
      boxShadow: {
        'ios-card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.03)',
        'ios-btn': '0 2px 8px rgba(0, 122, 255, 0.22)',
        'ios-sheet': '0 -4px 30px rgba(0, 0, 0, 0.12)',
        'ios-segmented': '0 3px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
