'use client';

import { useState } from 'react';
import { Check, Link2, MessageCircle, Send, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/helpers';

export function SocialShare({ url, text, className, compact = false }: { url: string; text: string; className?: string; compact?: boolean }) {
  const t = useTranslations('share');
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const links = [
    { key: 'whatsapp', label: t('whatsapp'), href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, icon: MessageCircle, className: 'bg-[#25D366] text-white hover:brightness-110' },
    { key: 'telegram', label: t('telegram'), href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, icon: Send, className: 'bg-[#229ED9] text-white hover:brightness-110' },
    { key: 'facebook', label: t('facebook'), href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: FacebookIcon, className: 'bg-[#1877F2] text-white hover:brightness-110' },
    { key: 'twitter', label: t('twitter'), href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, icon: XIcon, className: 'bg-black text-white hover:brightness-125' },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url, text, title: text });
      } catch {
        /* cancelled */
      }
    } else {
      void copy();
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {!compact && <span className="me-1 text-small font-semibold text-navy">{t('title')}:</span>}
      {links.map(({ key, label, href, icon: Icon, className: c }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn('inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-caption font-semibold transition', c)}
        >
          <Icon className="h-4 w-4" />
          {!compact && <span>{label}</span>}
        </a>
      ))}
      <button type="button" onClick={copy} className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-card-border bg-white px-3 text-caption font-semibold text-navy transition hover:border-primary" aria-live="polite">
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
        {!compact && <span>{copied ? t('copyLink') + ' ✓' : t('copyLink')}</span>}
      </button>
      <button type="button" onClick={nativeShare} className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-card-border bg-white px-3 text-caption font-semibold text-navy transition hover:border-primary sm:hidden" aria-label={t('native')}>
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
