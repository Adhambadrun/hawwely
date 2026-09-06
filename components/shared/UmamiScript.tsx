import Script from 'next/script';

/** Self-hosted Umami analytics — only injected when both env vars are configured. */
export function UmamiScript() {
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const url = process.env.NEXT_PUBLIC_UMAMI_URL;
  if (!id || !url) return null;
  const src = `${url.replace(/\/$/, '')}/script.js`;
  return <Script src={src} data-website-id={id} strategy="afterInteractive" defer />;
}
