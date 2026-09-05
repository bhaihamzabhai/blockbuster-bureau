import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#080B14',
        nebula: '#1A2540',
        gold: '#F0C040',
        stardust: '#8892A4',
        nova: '#3D6BFF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        drift: 'drift 120s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translateY(100vh)' },
          '100%': { transform: 'translateY(-100vh)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(240, 192, 64, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(240, 192, 64, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(240, 192, 64, 0.1)',
        'glow-lg': '0 0 40px rgba(240, 192, 64, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;