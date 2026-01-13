'use client';

import { useAuth } from '@/stores/useAuthStore';
import { Auth } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, FileText, Users, Truck, Building2, MapPin } from 'lucide-react';

const stats = [
  {
    name: 'Orders',
    description: 'Manage all delivery orders',
    icon: Package,
    href: '/orders',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Quotes',
    description: 'Create and manage quotes',
    icon: FileText,
    href: '/quotes',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Users',
    description: 'Manage client accounts',
    icon: Users,
    href: '/users',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Drivers',
    description: 'Manage driver accounts',
    icon: Truck,
    href: '/drivers',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    name: 'Businesses',
    description: 'Manage business accounts',
    icon: Building2,
    href: '/businesses',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  {
    name: 'Addresses',
    description: 'View saved addresses',
    icon: MapPin,
    href: '/addresses',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await Auth.logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-muted/40 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Admin'}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.name}
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
                Click to manage {stat.name.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
