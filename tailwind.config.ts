import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00C853',
          50: '#E6FAEE',
          100: '#C2F2D4',
          200: '#8FE6AE',
          300: '#5CD988',
          400: '#2ED169',
          500: '#00C853',
          600: '#00A846',
          700: '#008A3A',
          800: '#006B2D',
          900: '#004D20',
          light: '#00E676',
        },
        navy: {
          DEFAULT: '#1B2A4A',
          50: '#EEF1F7',
          100: '#D5DCEA',
          200: '#ABB9D5',
          300: '#8296BF',
          400: '#5873AA',
          500: '#3D5486',
          600: '#2D4069',
          700: '#1B2A4A',
          800: '#141F37',
          900: '#0F172A',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#E6C200',
        },
        surface: {
          DEFAULT: '#F8FAFB',
          dark: '#0F172A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          border: '#E2E8F0',
        },
        content: {
          DEFAULT: '#1E293B',
          secondary: '#64748B',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-cairo)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        caption: ['0.75rem', { lineHeight: '1rem' }],
        small: ['0.875rem', { lineHeight: '1.25rem' }],
        body: ['1rem', { lineHeight: '1.625rem' }],
        'section-m': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        section: ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'hero-m': ['2rem', { lineHeight: '2.5rem', fontWeight: '800' }],
        hero: ['3rem', { lineHeight: '3.5rem', fontWeight: '800' }],
        'h2-m': ['1.5rem', { lineHeight: '2rem', fontWeight: '800' }],
        h2: ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800' }],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        hover: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        modal: '0 25px 50px -12px rgba(0,0,0,0.25)',
        glow: '0 0 0 3px rgba(0,200,83,0.25)',
        gold: '0 0 0 2px #FFD700, 0 10px 30px -10px rgba(255,215,0,0.6)',
        silver: '0 0 0 2px #C0C0C0, 0 10px 30px -10px rgba(192,192,192,0.6)',
        bronze: '0 0 0 2px #CD7F32, 0 10px 30px -10px rgba(205,127,50,0.6)',
      },
      spacing: {
        section: '5rem',
        'section-m': '3rem',
      },
      maxWidth: {
        content: '1280px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-end': {
          '0%': { opacity: '0', transform: 'translateX(var(--slide-from, 16px))' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(var(--ticker-distance, -50%))' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.6)', opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'dots-drift': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease both',
        'fade-up': 'fade-up 400ms ease both',
        'slide-in-end': 'slide-in-end 300ms ease both',
        shimmer: 'shimmer 1.6s linear infinite',
        ticker: 'ticker 40s linear infinite',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'dots-drift': 'dots-drift 12s linear infinite',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00C853 0%, #00E676 100%)',
        'navy-gradient': 'linear-gradient(135deg, #1B2A4A 0%, #0F172A 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%)',
      },
    },
  },
  plugins: [typography],
};

export default config;
