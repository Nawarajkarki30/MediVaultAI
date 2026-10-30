/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F6FE',
          100: '#E0EDFE',
          200: '#C2DBFD',
          300: '#94C1FC',
          400: '#5F9EFA',
          500: '#2675F5', // Primary blue token
          600: '#1558D6',
          700: '#1043A6',
          800: '#113886',
          900: '#0B1B49', // Dark navy token
          navy: '#0B1B49',
          blue: '#2675F5',
          bg: '#F8FBFF',
          surface: '#FFFFFF',
          muted: '#526482',
          border: '#E2EAF8',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(11, 27, 73, 0.04), 0 1px 2px 0 rgba(11, 27, 73, 0.02)',
        card: '0 4px 20px -2px rgba(11, 27, 73, 0.05), 0 2px 6px -1px rgba(11, 27, 73, 0.03)',
        'card-hover':
          '0 10px 25px -4px rgba(38, 117, 245, 0.12), 0 4px 10px -2px rgba(11, 27, 73, 0.04)',
        preview: '0 20px 40px -15px rgba(11, 27, 73, 0.12), 0 0 0 1px rgba(226, 234, 248, 0.8)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
