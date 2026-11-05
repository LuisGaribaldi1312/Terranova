/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terranova: {
          950: '#061017',
          900: '#0B1D2A', // Azul profundo (Base Dark Mode)
          850: '#0E2837',
          800: '#123C50', // Azul petróleo (Superficies y Paneles)
          700: '#184E67',
          600: '#216888',
          500: '#17A987', // Verde tecnológico (Acento Primario)
          400: '#22C49F',
          300: '#5EE0C1',
          200: '#C2E5DE',
          100: '#E9F0F2', // Gris claro (Base Light Mode / Texto Dark)
          50:  '#F4F8F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-tech': '0 0 15px -3px rgba(23, 169, 135, 0.3)',
        'panel-dark': '0 10px 25px -5px rgba(6, 16, 23, 0.7), 0 8px 10px -6px rgba(6, 16, 23, 0.7)',
      }
    },
  },
  plugins: [],
}
