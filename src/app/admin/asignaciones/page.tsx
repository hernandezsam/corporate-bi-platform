import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AssignmentsManager } from "@/components/admin/assignments-manager";
import type { Profile } from "@/types/database";
import type { CorporateModule } from "@/types/modules";

export const metadata: Metadata = {
  title: "Asignaciones de Módulos",
};

export default async function AdminAsignacionesPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const [{ data: users }, { data: modules }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true }),
      supabase
        .from("modules")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("user_modules").select("user_id, module_id"),
    ]);

  return (
    <AssignmentsManager
      users={(users as Profile[]) ?? []}
      modules={(modules as CorporateModule[]) ?? []}
      initialAssignments={assignments ?? []}
    />
  );
}
