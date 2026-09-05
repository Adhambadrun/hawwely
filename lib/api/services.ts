import 'server-only';
import type { Service } from '@/lib/types';
import { SERVICES, SERVICES_BY_SLUG } from '@/lib/data/services';
import { createPublicClient } from '@/lib/supabase/public';
import { cached, TTL } from '@/lib/exchange/cache';

/**
 * Service catalogue. Reads from Supabase when configured, otherwise the
 * bundled seed. Optional editorial fields (pros/cons, brand colour) that are
 * not in the DB schema are merged from the seed by slug.
 */

function mergeEditorial(row: Partial<Service> & { slug: string }): Service {
  const seed = SERVICES_BY_SLUG[row.slug];
  return {
    ...(seed ?? {}),
    ...row,
    rating: Number(row.rating ?? seed?.rating ?? 0),
    total_reviews: Number(row.total_reviews ?? seed?.total_reviews ?? 0),
    payout_methods: (row.payout_methods ?? seed?.payout_methods ?? []) as Service['payout_methods'],
    send_methods: (row.send_methods ?? seed?.send_methods ?? []) as Service['send_methods'],
    supported_corridors: (row.supported_corridors ?? seed?.supported_corridors ?? []) as Service['supported_corridors'],
    pros: seed?.pros,
    pros_ar: seed?.pros_ar,
    cons: seed?.cons,
    cons_ar: seed?.cons_ar,
    brand_color: seed?.brand_color,
    headquarters_ar: seed?.headquarters_ar,
    license_info_ar: seed?.license_info_ar,
  } as Service;
}

export async function getServices(): Promise<Service[]> {
  return cached('services:all', TTL.catalog, async () => {
    const supabase = createPublicClient();
    if (!supabase) return SERVICES.filter((s) => s.is_active).sort((a, b) => a.priority_order - b.priority_order);

    const { data, error } = await supabase.from('services').select('*').eq('is_active', true).order('priority_order');
    if (error || !data || data.length === 0) {
      if (error) console.warn('[hawwely] services query failed, using seed:', error.message);
      return SERVICES.filter((s) => s.is_active);
    }
    return (data as (Partial<Service> & { slug: string })[]).map(mergeEditorial);
  });
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.id === id) ?? null;
}

export async function getServicesForCorridor(corridorCode: string): Promise<Service[]> {
  const services = await getServices();
  return services.filter((s) => s.supported_corridors.includes(corridorCode as Service['supported_corridors'][number]));
}

export async function getFeaturedServices(limit = 4): Promise<Service[]> {
  const services = await getServices();
  const featured = services.filter((s) => s.is_featured);
  return (featured.length ? featured : services).slice(0, limit);
}

export async function getSimilarServices(service: Service, limit = 3): Promise<Service[]> {
  const services = await getServices();
  return services
    .filter((s) => s.id !== service.id)
    .map((s) => ({
      s,
      score:
        s.supported_corridors.filter((c) => service.supported_corridors.includes(c)).length * 2 +
        s.payout_methods.filter((p) => service.payout_methods.includes(p)).length,
    }))
    .sort((a, b) => b.score - a.score || b.s.rating - a.s.rating)
    .slice(0, limit)
    .map((x) => x.s);
}
