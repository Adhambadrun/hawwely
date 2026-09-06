'use client';

import { useEffect } from 'react';
import { CircleCheck, CircleX, Info, X } from 'lucide-react';
import { useStore, type Toast as ToastType } from '@/store/useStore';
import { cn } from '@/lib/utils/helpers';

function ToastItem({ toast }: { toast: ToastType }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), toast.durationMs ?? 4000);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  const Icon = toast.variant === 'success' ? CircleCheck : toast.variant === 'error' ? CircleX : Info;
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border bg-white p-4 shadow-modal animate-slide-in-end',
        toast.variant === 'success' && 'border-primary/40',
        toast.variant === 'error' && 'border-danger/40',
        (!toast.variant || toast.variant === 'info') && 'border-card-border',
      )}
    >
      <Icon
        className={cn('mt-0.5 h-5 w-5 shrink-0', toast.variant === 'success' && 'text-primary', toast.variant === 'error' && 'text-danger', toast.variant === 'info' && 'text-navy')}
        aria-hidden
      />
      <div className="flex-1 text-small">
        <p className="font-semibold text-navy">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-content-secondary">{toast.description}</p>}
      </div>
      <button type="button" onClick={() => dismiss(toast.id)} className="rounded p-1 text-content-secondary hover:text-navy" aria-label="close">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[110] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

export function useToast() {
  return useStore((s) => s.pushToast);
}
