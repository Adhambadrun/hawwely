import Link from 'next/link';

/** Root-level 404 (outside the locale segment). Arabic-first, matches the brand. */
export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-surface text-content">
        <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <p className="text-7xl font-extrabold text-primary">404</p>
          <h1 className="mt-4 text-2xl font-bold text-navy">الصفحة دي مش موجودة</h1>
          <p className="mt-2 max-w-md text-content-secondary">يمكن اللينك اتغير أو الصفحة اتشالت. ارجع للرئيسية أو قارن الأسعار دلوقتي.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/" className="btn-primary">
              الرئيسية
            </Link>
            <Link href="/compare" className="btn-outline">
              قارن الأسعار
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
