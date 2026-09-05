import { redirect } from 'next/navigation';

/** Unreachable in practice (middleware rewrites "/" to the default locale) — kept as a safety net. */
export default function RootPage() {
  redirect('/');
}
