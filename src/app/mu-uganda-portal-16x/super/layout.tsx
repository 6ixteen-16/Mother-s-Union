import RoleGuard from "@/components/RoleGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["super_admin"]}>
      <div className="flex min-h-screen flex-col">
        <AdminTopBar label="Admin Panel" />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 bg-[var(--color-surface)] p-5 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
