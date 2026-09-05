'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/helpers';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

/** Accessible modal: focus trap, ESC to close, scroll lock, bottom-sheet on mobile. */
export function Modal({ open, onClose, title, children, footer, size = 'md', className }: ModalProps) {
  const t = useTranslations('common');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])') ?? [],
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'relative z-10 flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-modal animate-fade-up sm:rounded-card',
          sizes[size],
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-card-border px-6 py-4">
          {title ? (
            <h2 id={titleId} className="text-lg font-bold text-navy">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button type="button" onClick={onClose} className="rounded-full p-2 text-content-secondary transition hover:bg-navy-50 hover:text-navy" aria-label={t('close')}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-card-border px-6 py-4 safe-bottom">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
