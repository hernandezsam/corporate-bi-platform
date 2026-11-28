import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UserDetailEditor } from "@/components/admin/user-detail-editor";
import type { Profile } from "@/types/database";
import type { CorporateModule } from "@/types/modules";

const uuidSchema = z.string().uuid();

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUsuarioDetailPage({
  params,
}: UserDetailPageProps) {
  const { userId: currentAdminId } = await requireAdminUser();
  const { id } = await params;

  if (!uuidSchema.safeParse(id).success) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: profile }, { data: modules }, { data: assignments }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("modules")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("user_modules").select("module_id").eq("user_id", id),
    ]);

  if (!profile) {
    notFound();
  }

  return (
    <UserDetailEditor
      user={profile as Profile}
      modules={(modules as CorporateModule[]) ?? []}
      initialAssignedModuleIds={(assignments ?? []).map((a) => a.module_id)}
      currentAdminId={currentAdminId}
    />
  );
}
