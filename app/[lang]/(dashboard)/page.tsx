'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FileText, Users, Truck, Building2, MapPin } from 'lucide-react';
import { capitalize } from '@/utils/lang';

const navItems = [
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
];

export default function DashboardPage() {
  const { t, ready } = useTranslation();
  const router = useRouter();

  if (!ready) {
    return null;
  }

  const stats = navItems.map((item) => {
    const name = t(`models:${item.modelKey}_other`, { defaultValue: item.key });
    return {
      ...item,
      name: capitalize(name),
      description: t(`${item.key}:manage_description`, { defaultValue: `Manage ${item.key}` }),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('common:dashboard', { defaultValue: 'Dashboard' })}</h1>
        <p className="text-muted-foreground">
          {t('common:dashboard_welcome', { defaultValue: 'Welcome to the Mandados admin dashboard' })}
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
              <p className="text-sm text-muted-foreground">
                {t('common:click_to_manage', { resource: stat.name, defaultValue: `Click to manage ${stat.name}` })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
