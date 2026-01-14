import { Badge } from '@/components/ui/badge';

type Role = App.Enums.Role;

const roleConfig: Record<
  Role,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  admin: { label: 'Admin', variant: 'destructive' },
  'business.owner': { label: 'Business Owner', variant: 'default' },
  'business.user': { label: 'Business User', variant: 'secondary' },
  client: { label: 'Client', variant: 'outline' },
  driver: { label: 'Driver', variant: 'default' },
};

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] || { label: role, variant: 'outline' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
