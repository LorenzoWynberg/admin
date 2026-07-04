import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PushRegister } from '@/components/PushRegister';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <PushRegister />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="bg-muted/40 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
