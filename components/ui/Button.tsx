import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn bg-danger text-white hover:bg-red-600 active:scale-[0.98]',
  gold: 'btn bg-gold-gradient text-navy shadow-[0_4px_14px_rgba(255,215,0,0.4)] hover:brightness-105 active:scale-[0.98]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-caption',
  md: 'px-5 py-2.5 text-small',
  lg: 'px-6 py-3 text-body',
  xl: 'px-8 py-4 text-lg rounded-card',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
