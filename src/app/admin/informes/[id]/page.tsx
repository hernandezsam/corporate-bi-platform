import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReportDetailEditor } from "@/components/admin/report-detail-editor";
import type { Category, Profile, Report } from "@/types/database";

const uuidSchema = z.string().uuid();

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminInformeDetailPage({
  params,
}: ReportDetailPageProps) {
  await requireAdminUser();
  const { id } = await params;

  if (!uuidSchema.safeParse(id).success) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const [
    { data: report },
    { data: categories },
    { data: users },
    { data: assignments },
  ] = await Promise.all([
    supabase.from("reports").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
    supabase.from("user_reports").select("user_id").eq("report_id", id),
  ]);

  if (!report) {
    notFound();
  }

  return (
    <ReportDetailEditor
      report={report as Report}
      categories={(categories as Category[]) ?? []}
      users={(users as Profile[]) ?? []}
      initialAssignedUserIds={(assignments ?? []).map((a) => a.user_id)}
    />
  );
}
