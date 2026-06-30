import RoleGuard from "@/components/RoleGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["admin", "super_admin"]}>
      <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
        <AdminTopBar label="Staff Panel" />
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
