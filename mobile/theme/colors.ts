/** HAWWELY design tokens — identical palette to the website. */
export const colors = {
  primary: '#00C853',
  primaryDark: '#00A845',
  primaryLight: '#E8F9EE',
  primarySoft: '#C6F0D6',
  navy: '#1B2A4A',
  navyDark: '#0B1220',
  navyLight: '#F1F4F9',
  gold: '#FFD700',
  goldSoft: '#FFF6C2',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  background: '#F8FAFB',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  cardDark: '#1E293B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.55)',
  whatsapp: '#25D366',
} as const;

export type ColorName = keyof typeof colors;
