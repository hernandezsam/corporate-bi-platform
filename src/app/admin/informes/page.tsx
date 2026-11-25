import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReportsManager } from "@/components/admin/reports-manager";
import type { Category, Report, ReportWithAssignments } from "@/types/database";

export const metadata: Metadata = {
  title: "Gestión de Informes",
};

export default async function AdminInformesPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const [{ data: reports }, { data: categories }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("reports")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("user_reports").select("report_id, user_id"),
    ]);

  const map = new Map<string, string[]>();
  for (const row of assignments ?? []) {
    const list = map.get(row.report_id) ?? [];
    list.push(row.user_id);
    map.set(row.report_id, list);
  }

  const enriched: ReportWithAssignments[] = ((reports as Report[]) ?? []).map(
    (r) => {
      const ids = map.get(r.id) ?? [];
      return {
        ...r,
        assigned_user_ids: ids,
        assigned_users_count: ids.length,
      };
    }
  );

  return (
    <ReportsManager
      initialReports={enriched}
      categories={(categories as Category[]) ?? []}
    />
  );
}
