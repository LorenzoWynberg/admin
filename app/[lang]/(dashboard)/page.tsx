'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  FileText,
  Users,
  Truck,
  Building2,
  MapPin,
  Route,
  Database,
  DollarSign,
  Bell,
  Settings,
} from 'lucide-react';
import { capitalize, resourceMessage } from '@/utils/lang';

const navItems = [
  {
    key: 'routes',
    modelKey: 'route',
    icon: Route,
    href: '/routes',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
  {
    key: 'orders',
    modelKey: 'order',
    icon: Package,
    href: '/orders',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    key: 'quotes',
    modelKey: 'quote',
    icon: FileText,
    href: '/quotes',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    key: 'users',
    modelKey: 'user',
    icon: Users,
    href: '/users',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    key: 'drivers',
    modelKey: 'driver',
    icon: Truck,
    href: '/drivers',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    key: 'businesses',
    modelKey: 'business',
    icon: Building2,
    href: '/businesses',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  {
    key: 'addresses',
    modelKey: 'address',
    icon: MapPin,
    href: '/addresses',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    key: 'catalogs',
    modelKey: 'catalog',
    icon: Database,
    href: '/catalogs',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    key: 'pricing',
    modelKey: 'pricing',
    icon: DollarSign,
    href: '/pricing',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    descriptionKey: 'pricing:manage_description',
  },
  {
    key: 'notifications',
    modelKey: 'notification',
    icon: Bell,
    href: '/notifications',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    key: 'settings',
    modelKey: 'settings',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    descriptionKey: 'common:settings_description',
  },
];

export default function DashboardPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();

  if (!ready) {
    return null;
  }

  const stats = navItems.map((item) => {
    const name =
      'descriptionKey' in item
        ? t(`${item.key}:title`, { defaultValue: item.key })
        : t(`models:${item.modelKey}_other`, { defaultValue: item.key });
    const descKey =
      'descriptionKey' in item && item.descriptionKey
        ? item.descriptionKey
        : `${item.key}:manage_description`;
    return {
      ...item,
      name: capitalize(name),
      description: t(descKey, { defaultValue: `Manage ${item.key}` }),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {t('common:dashboard', { defaultValue: 'Dashboard' })}
        </h1>
        <p className="text-muted-foreground">
          {t('common:dashboard_welcome', {
            defaultValue: 'Welcome to the Mandados admin dashboard',
          })}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.key}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push(stat.href)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{stat.name}</CardTitle>
                <CardDescription>{stat.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {resourceMessage('click_to_manage', stat.modelKey, 2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
