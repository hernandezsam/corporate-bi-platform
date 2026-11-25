import type { Metadata } from "next";
import { requireActiveUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardWorkspace } from "@/components/intranet/dashboard-workspace";
import type { Report } from "@/types/database";

export const metadata: Metadata = {
  title: "Dashboard de Informes",
};

interface DashboardPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function IntranetDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { profile } = await requireActiveUser();
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <DashboardWorkspace
      profile={profile}
      reports={(reports as Report[]) ?? []}
      forbiddenNotice={params.error === "forbidden"}
    />
  );
}
