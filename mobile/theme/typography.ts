import { I18nManager, type TextStyle } from 'react-native';

export const fonts = {
  cairo: 'Cairo_400Regular',
  cairoMedium: 'Cairo_500Medium',
  cairoSemiBold: 'Cairo_600SemiBold',
  cairoBold: 'Cairo_700Bold',
  cairoExtraBold: 'Cairo_800ExtraBold',
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
} as const;

export const fontSize = { hero: 32, h1: 28, h2: 24, h3: 20, body: 16, small: 14, caption: 12, micro: 11 } as const;

const base = (family: string, size: number, lineHeight?: number): TextStyle => ({ fontFamily: family, fontSize: size, lineHeight: lineHeight ?? Math.round(size * 1.5), color: '#0F172A' });

/** Text presets. Arabic UI uses Cairo; numerals always use Inter (tabular). */
export const typography = {
  hero: base(fonts.cairoExtraBold, fontSize.hero, 42),
  h1: base(fonts.cairoBold, fontSize.h1, 38),
  h2: base(fonts.cairoBold, fontSize.h2, 32),
  h3: base(fonts.cairoSemiBold, fontSize.h3, 28),
  body: base(fonts.cairo, fontSize.body, 26),
  bodyBold: base(fonts.cairoSemiBold, fontSize.body, 26),
  small: base(fonts.cairo, fontSize.small, 22),
  smallBold: base(fonts.cairoSemiBold, fontSize.small, 22),
  caption: base(fonts.cairo, fontSize.caption, 18),
  captionBold: base(fonts.cairoSemiBold, fontSize.caption, 18),
  numHero: { ...base(fonts.interBold, 36, 44), fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  numLarge: { ...base(fonts.interBold, 24, 32), fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  num: { ...base(fonts.interSemiBold, fontSize.body, 24), fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  numSmall: { ...base(fonts.interMedium, fontSize.small, 20), fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
} as const;

export const textAlignStart: TextStyle = { textAlign: I18nManager.isRTL ? 'right' : 'left', writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' };
