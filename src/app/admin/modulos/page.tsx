import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ModulesManager } from "@/components/admin/modules-manager";
import type { Category, Profile } from "@/types/database";
import type { CorporateModule, ModuleWithAssignments } from "@/types/modules";

export const metadata: Metadata = {
  title: "Gestión de Módulos",
};

export default async function AdminModulosPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const [
    { data: modules },
    { data: categories },
    { data: profiles },
    { data: assignments },
  ] = await Promise.all([
    supabase
      .from("modules")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
    supabase.from("user_modules").select("module_id, user_id"),
  ]);

  const map = new Map<string, string[]>();
  for (const row of assignments ?? []) {
    const list = map.get(row.module_id) ?? [];
    list.push(row.user_id);
    map.set(row.module_id, list);
  }

  const enriched: ModuleWithAssignments[] = (
    (modules as CorporateModule[]) ?? []
  ).map((m) => {
    const ids = map.get(m.id) ?? [];
    return {
      ...m,
      assigned_user_ids: ids,
      assigned_users_count: ids.length,
    };
  });

  return (
    <ModulesManager
      initialModules={enriched}
      categories={(categories as Category[]) ?? []}
      users={(profiles as Profile[]) ?? []}
    />
  );
}
