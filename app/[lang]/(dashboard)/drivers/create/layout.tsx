import { RequireAdmin } from '@/components/auth/RequireAdmin';

export default function DriverCreateLayout({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
