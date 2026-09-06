import { cn } from '@/lib/utils/helpers';

/** Renders a flag emoji with consistent sizing and an accessible label. */
export function CountryFlag({ emoji, label, size = 'md', className }: { emoji: string; label: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { sm: 'text-base', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' };
  return (
    <span role="img" aria-label={label} className={cn('inline-block leading-none', sizes[size], className)} style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>
      {emoji}
    </span>
  );
}
