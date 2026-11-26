import { requireActiveUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  IntranetShell,
  type SidebarReportItem,
} from "@/components/intranet/intranet-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedIntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireActiveUser();
  const supabase = await createServerSupabaseClient();

  // Mínimo privilegio en payload RSC: solo metadatos necesarios para el menú lateral
  // (no se serializa powerbi_url en el layout global).
  const { data: reports } = await supabase
    .from("reports")
    .select("id, name, icon, category, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <IntranetShell
      profile={profile}
      reports={(reports as SidebarReportItem[]) ?? []}
    >
      {children}
    </IntranetShell>
  );
}
