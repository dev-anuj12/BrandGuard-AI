/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        purple: {
          midnight: '#090414',
          deep: '#160827',
          card: '#120924',
          surface: '#1A0D30',
          elevated: '#23123F',
          subtle: '#2D164E',
        },
        navy: {
          800: '#111827',
          900: '#0B0F19',
          950: '#070A10',
          canvas: '#090414',
          card: '#120924',
          subtle: '#1A0D30',
        },
        violet: {
          rich: '#782BDB',
        },
        electric: {
          purple: '#A855F7',
          magenta: '#D946EF',
          blue: '#38BDF8',
          indigo: '#6366F1',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(168, 85, 247, 0.25)',
        'glow-md': '0 0 25px -5px rgba(120, 43, 219, 0.3)',
        'glow-lg': '0 0 40px -8px rgba(168, 85, 247, 0.35)',
        'glow-magenta': '0 0 25px -4px rgba(217, 70, 239, 0.25)',
        'glow-cyan': '0 0 20px -4px rgba(56, 189, 248, 0.2)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'inner-purple': 'inset 0 1px 0 0 rgba(168, 85, 247, 0.25)',
      }
    },
  },
  plugins: [],
}
