import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UsersManager } from "@/components/admin/users-manager";
import type { Profile, ProfileWithAssignments } from "@/types/database";
import type { CorporateModule } from "@/types/modules";

export const metadata: Metadata = {
  title: "Gestión de Usuarios",
};

export default async function AdminUsuariosPage() {
  const { userId } = await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const [{ data: profiles }, { data: modules }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("modules")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("user_modules").select("user_id, module_id"),
    ]);

  const map = new Map<string, string[]>();
  for (const row of assignments ?? []) {
    const list = map.get(row.user_id) ?? [];
    list.push(row.module_id);
    map.set(row.user_id, list);
  }

  const enrichedUsers: ProfileWithAssignments[] = (
    (profiles as Profile[]) ?? []
  ).map((p) => {
    const ids = map.get(p.id) ?? [];
    return {
      ...p,
      assigned_report_ids: ids,
      assigned_reports_count: ids.length,
    };
  });

  return (
    <UsersManager
      initialUsers={enrichedUsers}
      modules={(modules as CorporateModule[]) ?? []}
      currentAdminId={userId}
    />
  );
}
