/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/index.html', './client/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#070712',
        panel: '#121226',
        accent: '#8b5cf6',
        glow: '#38bdf8'
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.28)'
      }
    }
  },
  plugins: []
};
