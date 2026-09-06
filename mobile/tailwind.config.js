/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00C853', 50: '#E8F9EE', 100: '#C6F0D6', 200: '#8FE3AF', 600: '#00A845', 700: '#008A39' },
        navy: { DEFAULT: '#1B2A4A', 50: '#F1F4F9', 100: '#E3E8F1', 700: '#15213A', 900: '#0B1220' },
        gold: '#FFD700',
        surface: '#F8FAFB',
        ink: { DEFAULT: '#0F172A', secondary: '#64748B', card: '#1E293B' },
        line: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        cairo: ['Cairo_400Regular'],
        'cairo-semibold': ['Cairo_600SemiBold'],
        'cairo-bold': ['Cairo_700Bold'],
        'cairo-extrabold': ['Cairo_800ExtraBold'],
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
      borderRadius: { card: '16px', btn: '12px', chip: '9999px' },
    },
  },
  plugins: [],
};
