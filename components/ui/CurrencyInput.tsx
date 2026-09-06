'use client';

import { forwardRef, useId, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';
import { groupDigits, parseAmount } from '@/lib/utils/formatters';

export interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size'> {
  value: number;
  onValueChange: (value: number) => void;
  currency: string;
  label?: string;
  error?: string;
  size?: 'md' | 'lg';
}

/** Amount input with digit grouping, Arabic numeral normalisation, and a currency chip. */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(function CurrencyInput(
  { value, onValueChange, currency, label, error, className, size = 'lg', id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [text, setText] = useState(value ? groupDigits(value) : '');
  const [lastValue, setLastValue] = useState(value);

  // Sync when the parent changes the value (e.g. quick-amount buttons)
  if (value !== lastValue) {
    setLastValue(value);
    if (parseAmount(text) !== value) setText(value ? groupDigits(value) : '');
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const n = parseAmount(raw);
    // Preserve a trailing decimal point while typing
    const endsWithDot = /[.٫]$/.test(raw);
    setText(n ? `${groupDigits(n)}${endsWithDot ? '.' : ''}` : raw.replace(/[^0-9.]/g, ''));
    onValueChange(n);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className={cn('relative flex items-center rounded-card border bg-white transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30', error ? 'border-danger' : 'border-card-border')}>
        <input
          ref={ref}
          id={inputId}
          inputMode="decimal"
          autoComplete="off"
          dir="ltr"
          aria-invalid={!!error || undefined}
          value={text}
          onChange={handleChange}
          className={cn('num w-full min-w-0 flex-1 bg-transparent px-4 text-start font-bold text-navy outline-none placeholder:text-navy-200', size === 'lg' ? 'py-3.5 text-2xl' : 'py-2.5 text-lg', className)}
          {...props}
        />
        <span className="me-2 shrink-0 rounded-btn bg-navy-50 px-3 py-1.5 text-small font-bold text-navy" aria-hidden>
          {currency}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
