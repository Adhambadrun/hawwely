import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={!!error || undefined}
        className={cn('input min-h-[120px] resize-y', error && 'input-error', className)}
        {...props}
      />
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
