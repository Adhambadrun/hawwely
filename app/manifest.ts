import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'حوّلي — Hawwely',
    short_name: 'حوّلي',
    description: 'قارن أسعار تحويل الفلوس لمصر في ثواني — أرسل أكتر، ادفع أقل.',
    id: '/',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#F8FAFB',
    theme_color: '#1B2A4A',
    categories: ['finance', 'utilities'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'قارن الأسعار', short_name: 'قارن', url: '/compare', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'أسعار الصرف', short_name: 'الأسعار', url: '/rates', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
