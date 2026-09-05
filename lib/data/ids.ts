/**
 * Deterministic UUIDs for seed data so the bundled demo dataset and the
 * Supabase seed SQL always agree (links, alerts and reviews reference them).
 */
function pad(n: number): string {
  return n.toString().padStart(12, '0');
}

export const serviceId = (n: number) => `11111111-1111-4111-8111-${pad(n)}`;
export const corridorId = (n: number) => `22222222-2222-4222-8222-${pad(n)}`;
export const rateId = (n: number) => `33333333-3333-4333-8333-${pad(n)}`;
export const faqId = (n: number) => `44444444-4444-4444-8444-${pad(n)}`;
export const blogId = (n: number) => `55555555-5555-4555-8555-${pad(n)}`;
export const reviewId = (n: number) => `66666666-6666-4666-8666-${pad(n)}`;
export const testimonialId = (n: number) => `77777777-7777-4777-8777-${pad(n)}`;
