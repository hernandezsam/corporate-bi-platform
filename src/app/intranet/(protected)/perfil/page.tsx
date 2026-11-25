import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/intranet/profile-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/types/database";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default async function IntranetPerfilPage() {
  const { profile } = await requireActiveUser();
  const supabase = await createServerSupabaseClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, name, category, active")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const availableReports = (reports as Pick<Report, "id" | "name" | "category" | "active">[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Mi Perfil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Administre sus datos básicos y contraseña de acceso a la intranet.
        </p>
      </div>

      <ProfileForm profile={profile} />

      <Card>
        <CardHeader>
          <CardTitle>Informes habilitados en su cuenta</CardTitle>
          <CardDescription>
            Listado de informes de Power BI a los que su usuario tiene acceso actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableReports.length === 0 ? (
            <p className="text-sm text-slate-500">
              No tiene informes asignados actualmente.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableReports.map((rep) => (
                <Link
                  key={rep.id}
                  href={`/intranet/reportes/${rep.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
                >
                  <span>{rep.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {rep.category}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
