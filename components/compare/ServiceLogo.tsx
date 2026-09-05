import Image from 'next/image';
import { cn } from '@/lib/utils/helpers';

export function ServiceLogo({
  src,
  name,
  size = 48,
  className,
  brandColor,
}: {
  src: string | null | undefined;
  name: string;
  size?: number;
  className?: string;
  brandColor?: string;
}) {
  if (!src) {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center rounded-card text-lg font-extrabold text-white', className)}
        style={{ width: size, height: size, backgroundColor: brandColor ?? '#1B2A4A' }}
        aria-hidden
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-card border border-card-border bg-white', className)} style={{ width: size, height: size }}>
      <Image src={src} alt={name} width={size} height={size} className="h-full w-full object-contain p-1.5" unoptimized={src.endsWith('.svg')} />
    </span>
  );
}
