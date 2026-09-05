import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, className, id, size = 'md', ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error || undefined}
          className={cn('input cursor-pointer appearance-none pe-10', size === 'lg' && 'py-3.5 text-lg font-semibold', error && 'input-error', className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-secondary" aria-hidden />
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-caption font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-caption text-content-secondary">{hint}</p>
      ) : null}
    </div>
  );
});
