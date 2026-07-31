/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0B0B12',
        surface: '#15141F',
        raised: '#1D1B29',
        line: '#2A2836',
        violet: {
          DEFAULT: '#7C5CFF',
          soft: '#9B82FF',
          dim: '#5B42C9',
        },
        amber: {
          DEFAULT: '#FFB84D',
          soft: '#FFD08A',
        },
        ink: {
          DEFAULT: '#F4F2FA',
          muted: '#9C98AE',
          faint: '#6B6780',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top right, rgba(124,92,255,0.25), transparent 60%)',
      },
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        eq: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 8s linear infinite',
        'eq-1': 'eq 0.9s ease-in-out infinite',
        'eq-2': 'eq 1.2s ease-in-out infinite 0.1s',
        'eq-3': 'eq 0.7s ease-in-out infinite 0.2s',
        'eq-4': 'eq 1.0s ease-in-out infinite 0.05s',
        'fade-up': 'fade-up 0.6s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
