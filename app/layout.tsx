import type { ReactNode } from 'react';
import './globals.css';

/**
 * Root layout. The real <html>/<body> are rendered by app/[locale]/layout.tsx
 * so that `lang` and `dir` match the active locale. This file only exists to
 * host global CSS and the root-level error/not-found boundaries.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
