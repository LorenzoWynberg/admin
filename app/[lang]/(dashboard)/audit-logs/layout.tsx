import { RequireAdmin } from '@/components/auth/RequireAdmin';

export default function AuditLogsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
