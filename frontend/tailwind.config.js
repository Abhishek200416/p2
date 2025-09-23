/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Infinity Castle Color Palette
        'bg': '#0b0f14',
        'panel': '#101620',
        'panel-2': '#0d141d',
        'ink': '#cfd8e3',
        'muted': '#9fb3c8',
        'acc-1': '#7bdfff',
        'acc-2': '#e6b800',
        'ok': '#10b981',
        'warn': '#f59e0b',
        'bad': '#ef4444',
        'ring': '#7bdfff',
        'panel-hover': '#1a1f2e',
        'glass-bg': 'rgba(16, 22, 32, 0.8)',
        'glass-border': 'rgba(123, 223, 255, 0.2)',
        'shadow-dark': 'rgba(0, 0, 0, 0.5)',
        'shadow-glow': 'rgba(123, 223, 255, 0.1)',
      },
      fontFamily: {
        'display': ['Sora', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'float-slow': 'float 20s ease-in-out infinite',
        'float-medium': 'float 15s ease-in-out infinite',
        'float-reverse': 'float-reverse 18s ease-in-out infinite',
        'float-slow-reverse': 'float-reverse 22s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '33%': { transform: 'translateY(-20px) scale(1.05)' },
          '66%': { transform: 'translateY(10px) scale(0.95)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '33%': { transform: 'translateY(15px) scale(0.95)' },
          '66%': { transform: 'translateY(-12px) scale(1.05)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(123, 223, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(123, 223, 255, 0)' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(40px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
  safelist: [
    'animate-fade-in',
    'animate-slide-up', 
    'animate-pulse-glow',
    'text-acc-1',
    'text-acc-2',
    'text-ok',
    'bg-acc-1',
    'bg-acc-2',
    'border-acc-1',
    'border-acc-2',
    'hover:text-acc-1',
    'hover:text-acc-2',
    'hover:bg-acc-1',
    'hover:bg-acc-2',
    'hover:border-acc-1',
    'hover:border-acc-2',
    'group-hover:text-acc-1',
    'group-hover:text-acc-2',
  ]
};