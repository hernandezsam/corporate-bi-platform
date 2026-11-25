import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UsersManager } from "@/components/admin/users-manager";
import type { Profile, ProfileWithAssignments, Report } from "@/types/database";

export const metadata: Metadata = {
  title: "Gestión de Usuarios",
};

export default async function AdminUsuariosPage() {
  const { userId } = await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const [{ data: profiles }, { data: reports }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("reports")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("user_reports").select("user_id, report_id"),
    ]);

  const map = new Map<string, string[]>();
  for (const row of assignments ?? []) {
    const list = map.get(row.user_id) ?? [];
    list.push(row.report_id);
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
      reports={(reports as Report[]) ?? []}
      currentAdminId={userId}
    />
  );
}
