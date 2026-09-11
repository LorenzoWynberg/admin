import { RequireAdmin } from '@/components/auth/RequireAdmin';

export default function StaffCreateLayout({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
