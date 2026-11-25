import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AssignmentsManager } from "@/components/admin/assignments-manager";
import type { Profile, Report } from "@/types/database";

export const metadata: Metadata = {
  title: "Asignaciones de Informes",
};

export default async function AdminAsignacionesPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const [{ data: users }, { data: reports }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true }),
      supabase
        .from("reports")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("user_reports").select("user_id, report_id"),
    ]);

  return (
    <AssignmentsManager
      users={(users as Profile[]) ?? []}
      reports={(reports as Report[]) ?? []}
      initialAssignments={assignments ?? []}
    />
  );
}
