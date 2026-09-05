import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/helpers';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, startAdornment, endAdornment, className, wrapperClassName, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {startAdornment && (
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-content-secondary">{startAdornment}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={cn('input', startAdornment && 'ps-10', endAdornment && 'pe-12', error && 'input-error', className)}
          {...props}
        />
        {endAdornment && <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-content-secondary">{endAdornment}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-caption font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-caption text-content-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
