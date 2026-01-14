'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Truck,
  Building2,
  MapPin,
  Database,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: Package },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Drivers', href: '/drivers', icon: Truck },
  { name: 'Businesses', href: '/businesses', icon: Building2 },
  { name: 'Addresses', href: '/addresses', icon: MapPin },
  { name: 'Catalogs', href: '/catalogs', icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  // Helper to build language-prefixed links
  const withLang = (href: string) => `/${lang}${href === '/' ? '' : href}`;

  // Get path without language prefix for active state check
  const pathWithoutLang = pathname.replace(new RegExp(`^/${lang}`), '') || '/';

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href={withLang('/')} className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Mandados</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive =
              pathWithoutLang === item.href ||
              (item.href !== '/' && pathWithoutLang.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={withLang(item.href)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="border-t p-4">
          <Link
            href={withLang('/settings')}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathWithoutLang === '/settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
