import { requireActiveUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { IntranetShell } from "@/components/intranet/intranet-shell";
import type { Report } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProtectedIntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireActiveUser();
  const supabase = await createServerSupabaseClient();

  // RLS en PostgreSQL filtra automáticamente para que un USER solo reciba
  // informes activos que tenga explícitamente asignados en user_reports.
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <IntranetShell profile={profile} reports={(reports as Report[]) ?? []}>
      {children}
    </IntranetShell>
  );
}
