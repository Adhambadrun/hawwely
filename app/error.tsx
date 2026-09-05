'use client';

import { useEffect } from 'react';

/** Root error boundary (rarely reached; locale-level error.tsx handles most cases). */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[hawwely] root error:', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-surface text-content">
        <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold text-navy">حصلت مشكلة</h1>
          <p className="mt-2 max-w-md text-content-secondary">معلش، حصل خطأ غير متوقع. جرب تاني.</p>
          <button type="button" onClick={reset} className="btn-primary mt-8">
            حاول تاني
          </button>
        </main>
      </body>
    </html>
  );
}
