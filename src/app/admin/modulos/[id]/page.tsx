import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ModuleDetailEditor } from "@/components/admin/module-detail-editor";
import type { Category, Profile } from "@/types/database";
import type { CorporateModule } from "@/types/modules";

const uuidSchema = z.string().uuid();

interface ModuleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminModuloDetailPage({
  params,
}: ModuleDetailPageProps) {
  const { profile: adminProfile } = await requireAdminUser();
  const { id } = await params;

  if (!uuidSchema.safeParse(id).success) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const [
    { data: mod },
    { data: categories },
    { data: users },
    { data: assignments },
  ] = await Promise.all([
    supabase.from("modules").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
    supabase.from("user_modules").select("user_id").eq("module_id", id),
  ]);

  if (!mod) {
    notFound();
  }

  return (
    <ModuleDetailEditor
      module={mod as CorporateModule}
      categories={(categories as Category[]) ?? []}
      users={(users as Profile[]) ?? []}
      initialAssignedUserIds={(assignments ?? []).map((a) => a.user_id)}
      adminProfile={adminProfile}
    />
  );
}
