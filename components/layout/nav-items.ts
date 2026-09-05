import { Bell, BookOpen, Building2, ChartLine, Home, Landmark, Search, type LucideIcon } from 'lucide-react';

export interface NavItem {
  key: 'home' | 'compare' | 'sendMoney' | 'rates' | 'services' | 'alerts' | 'blog';
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', href: '/', icon: Home },
  { key: 'compare', href: '/compare', icon: Search },
  { key: 'sendMoney', href: '/send-money', icon: Landmark },
  { key: 'rates', href: '/rates', icon: ChartLine },
  { key: 'services', href: '/services', icon: Building2 },
  { key: 'alerts', href: '/alerts', icon: Bell },
  { key: 'blog', href: '/blog', icon: BookOpen },
];
