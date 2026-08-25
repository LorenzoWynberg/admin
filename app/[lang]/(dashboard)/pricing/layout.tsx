import { RequireAdmin } from '@/components/auth/RequireAdmin';

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
