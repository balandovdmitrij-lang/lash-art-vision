/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#08081A',
        'deep-space': '#12082A',
        'cyber-pink': '#FF2D8A',
        'electric-violet': '#9B5DE5',
        'electric-cyan': '#00D4FF',
        'rose-gold': '#D4A853',
        'card-bg': '#1A1040',
        'text-primary': '#F0EAFF',
        'text-muted': '#9080B0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(255,45,138,0.7), 0 0 50px rgba(255,45,138,0.3)',
        'neon-sm': '0 0 10px rgba(255,45,138,0.5)',
        'neon-violet': '0 0 20px rgba(155,93,229,0.7), 0 0 50px rgba(155,93,229,0.3)',
        'neon-cyan': '0 0 20px rgba(0,212,255,0.6)',
        rose: '0 0 20px rgba(212,168,83,0.5)',
        card: '0 8px 40px rgba(155,93,229,0.15), 0 2px 8px rgba(0,0,0,0.5)',
        'card-hover': '0 12px 50px rgba(255,45,138,0.2), 0 4px 16px rgba(155,93,229,0.15)',
      },
      backdropBlur: {
        glass: '24px',
      },
      animation: {
        'float-slow': 'floatOrb 10s ease-in-out infinite',
        'float-mid': 'floatOrb 7s ease-in-out infinite',
        'pulse-line': 'pulseLine 3s ease-in-out infinite',
        'shimmer': 'shimmerBorder 4s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        floatOrb: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(20px,-30px) scale(1.06)' },
          '66%': { transform: 'translate(-15px,20px) scale(0.94)' },
        },
        pulseLine: {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmerBorder: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
