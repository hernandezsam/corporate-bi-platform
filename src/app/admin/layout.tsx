import { requireAdminUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdminUser();
  return <AdminShell profile={profile}>{children}</AdminShell>;
}
