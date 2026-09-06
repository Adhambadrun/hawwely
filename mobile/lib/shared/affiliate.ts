/* AUTO-GENERATED from website lib/ by scripts/sync-shared.js — do not edit. */
import type { Service } from './types';

/**
 * Builds the outbound URL for a provider.
 * - Replaces `{X_AFFILIATE_ID}` placeholders in seed URLs with the env value.
 * - Falls back to the plain website URL when no affiliate id is configured
 *   (so we never send users to a broken "YOUR_ID" link).
 * - Appends UTM tags so providers can attribute traffic to Hawwely.
 *
 * Safe to run on the server only (reads process.env). The /api/clicks route
 * returns the final URL to the browser, which then opens it.
 */
export function buildAffiliateUrl(service: Pick<Service, 'slug' | 'affiliate_url' | 'website_url'>, corridorCode?: string | null): string | null {
  const envIds: Record<string, string | undefined> = {
    '{WISE_AFFILIATE_ID}': undefined,
    '{REMITLY_AFFILIATE_ID}': undefined,
    '{PAYSEND_AFFILIATE_ID}': undefined,
    '{WORLDREMIT_AFFILIATE_ID}': undefined,
  };

  let url: string | null = null;
  const template = service.affiliate_url?.trim();

  if (template) {
    const placeholder = Object.keys(envIds).find((p) => template.includes(p));
    if (placeholder) {
      const id = envIds[placeholder];
      url = id ? template.replace(placeholder, encodeURIComponent(id)) : null;
    } else if (!/YOUR_/i.test(template)) {
      url = template;
    }
  }

  if (!url) url = service.website_url;
  if (!url) return null;

  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'hawwely');
    u.searchParams.set('utm_medium', 'comparison');
    if (corridorCode) u.searchParams.set('utm_campaign', corridorCode.toLowerCase());
    return u.toString();
  } catch {
    return url;
  }
}
