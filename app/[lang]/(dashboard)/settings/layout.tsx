import { RequireAdmin } from '@/components/auth/RequireAdmin';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
