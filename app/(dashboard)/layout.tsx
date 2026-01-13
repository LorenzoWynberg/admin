export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For now, just render children. We'll add sidebar later.
  return <>{children}</>;
}
