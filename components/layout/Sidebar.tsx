'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/lang';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Truck,
  Building2,
  MapPin,
  Database,
  DollarSign,
  Bell,
  Settings,
  ScrollText,
  Route,
  AlertTriangle,
} from 'lucide-react';
import { useNeedsAttention } from '@/hooks/orders/useNeedsAttention';

const navigation = [
  { modelKey: 'dashboard', href: '/', icon: LayoutDashboard, isModel: false },
  {
    modelKey: 'needs_attention',
    href: '/needs-attention',
    icon: AlertTriangle,
    isModel: false,
    translationKey: 'orders:needs_attention.title',
    hasBadge: true,
  },
  { modelKey: 'route', href: '/routes', icon: Route, isModel: true },
  { modelKey: 'order', href: '/orders', icon: Package, isModel: true },
  { modelKey: 'quote', href: '/quotes', icon: FileText, isModel: true },
  { modelKey: 'user', href: '/users', icon: Users, isModel: true },
  { modelKey: 'driver', href: '/drivers', icon: Truck, isModel: true },
  { modelKey: 'business', href: '/businesses', icon: Building2, isModel: true },
  { modelKey: 'address', href: '/addresses', icon: MapPin, isModel: true },
  { modelKey: 'catalog', href: '/catalogs', icon: Database, isModel: true },
  {
    modelKey: 'pricing',
    href: '/pricing',
    icon: DollarSign,
    isModel: false,
    translationKey: 'pricing:title',
  },
  { modelKey: 'notification', href: '/notifications', icon: Bell, isModel: true },
  { modelKey: 'audit_log', href: '/audit-logs', icon: ScrollText, isModel: true },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t, ready } = useTranslation();
  const pathname = usePathname();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const { data: needsAttentionData } = useNeedsAttention();
  const urgentCount =
    (needsAttentionData?.summary?.critical ?? 0) + (needsAttentionData?.summary?.high ?? 0);

  const withLang = (href: string) => `/${lang}${href === '/' ? '' : href}`;
  const pathWithoutLang = pathname.replace(new RegExp(`^/${lang}`), '') || '/';

  const getNavLabel = (item: (typeof navigation)[0]) => {
    if (!ready) return '';
    let label: string;
    if ('translationKey' in item && item.translationKey) {
      label = t(item.translationKey, { defaultValue: item.modelKey });
    } else if (item.isModel) {
      label = t(`models:${item.modelKey}_other`, { defaultValue: item.modelKey });
    } else {
      label = t(`common:${item.modelKey}`, { defaultValue: item.modelKey });
    }
    return capitalize(label);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href={withLang('/')} className="flex items-center gap-2" onClick={onNavigate}>
          <Package className="text-primary h-6 w-6" />
          <span className="text-xl font-bold">Mandados</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive =
            pathWithoutLang === item.href ||
            (item.href !== '/' && pathWithoutLang.startsWith(item.href));

          return (
            <Link
              key={item.modelKey}
              href={withLang(item.href)}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {getNavLabel(item)}
              {'hasBadge' in item && item.hasBadge && urgentCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white">
                  {urgentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t p-4">
        <Link
          href={withLang('/settings')}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathWithoutLang === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          {ready ? capitalize(t('common:settings', { count: 2 })) : ''}
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { open, setOpen } = useSidebarStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="bg-card hidden w-64 shrink-0 border-r lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar (sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
