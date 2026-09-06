import { cn } from '@/lib/utils/helpers';

/**
 * HAWWELY logo mark: green gradient rounded square with an arrow pointing
 * right-to-left (money flowing TO Egypt) + wordmark.
 */
export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="hw-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00C853" />
          <stop offset="1" stopColor="#00E676" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#hw-grad)" />
      <path d="M46 32H20" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 20L18 32L30 44" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47" cy="32" r="4" fill="#FFD700" />
    </svg>
  );
}

export function Logo({ dark = false, className, showTagline = false, locale = 'ar' }: { dark?: boolean; className?: string; showTagline?: boolean; locale?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={36} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-cairo text-2xl font-extrabold tracking-tight', dark ? 'text-white' : 'text-navy')}>
          {locale === 'ar' ? 'حوّلي' : 'Hawwely'}
        </span>
        {showTagline && <span className={cn('mt-1 text-caption font-medium', dark ? 'text-white/70' : 'text-content-secondary')}>{locale === 'ar' ? 'Hawwely' : 'حوّلي'}</span>}
      </span>
    </span>
  );
}
