'use client';

import { DispatchBoard } from '@/components/routes/DispatchBoard';

export default function RoutesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <DispatchBoard />
    </div>
  );
}
