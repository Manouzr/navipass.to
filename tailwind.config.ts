import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F2F2F7',
        'bg-card': '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'accent-cta': '#E63946',
        'accent-cta-hover': '#D62839',
        'accent-blue': '#0077B6',
        'accent-blue-light': '#00A3E0',
        'nav-active': '#4BAFD4',
        'nav-inactive': '#636366',
        'border-light': '#E5E7EB',
        'idf-blue': '#4BAFD4',
        'idf-dark': '#0A1628',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
        'navigo': '0 20px 60px rgba(75,175,212,0.35)',
        'navigo-hover': '0 30px 80px rgba(75,175,212,0.5)',
      },
      borderRadius: {
        card: '16px',
        input: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1.5deg)' },
          '50%': { transform: 'translateY(-14px) rotate(-1.5deg)' },
        },
        'float-still': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-still': 'float-still 4s ease-in-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.5s ease-out both',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'slide-in-right': 'slide-in-right 0.6s ease-out both',
      },
    },
  },
  plugins: [],
}
export default config
