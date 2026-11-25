import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolvePowerBiEmbedConfig } from "@/services/powerbi.service";
import { PowerBiViewer } from "@/components/intranet/powerbi-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Report } from "@/types/database";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

const uuidSchema = z.string().uuid();

export default async function IntranetReportViewerPage({
  params,
}: ReportPageProps) {
  const { profile } = await requireActiveUser();
  const { id } = await params;

  const validId = uuidSchema.safeParse(id);
  if (!validId.success) {
    return <UnauthorizedReportState />;
  }

  const supabase = await createServerSupabaseClient();

  // 1. Consulta protegida por RLS en PostgreSQL
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", validId.data)
    .maybeSingle();

  if (!report) {
    return <UnauthorizedReportState />;
  }

  // 2. Verificación explícita adicional en servidor (defensa en profundidad)
  if (profile.role !== "ADMIN") {
    if (!report.active) {
      return <UnauthorizedReportState />;
    }

    const { data: assignment } = await supabase
      .from("user_reports")
      .select("id")
      .eq("user_id", profile.id)
      .eq("report_id", report.id)
      .maybeSingle();

    if (!assignment) {
      return <UnauthorizedReportState />;
    }
  }

  try {
    const embedConfig = await resolvePowerBiEmbedConfig(report as Report);
    return (
      <PowerBiViewer
        report={report as Report}
        embedConfig={embedConfig}
        isAdmin={profile.role === "ADMIN"}
      />
    );
  } catch {
    return (
      <Card className="mx-auto max-w-lg border-red-200">
        <CardContent className="p-8 text-center space-y-4">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="text-lg font-semibold text-slate-900">
            URL de informe inválida
          </h1>
          <p className="text-sm text-slate-600">
            La dirección configurada para este informe no cumple con las políticas
            de seguridad HTTPS. Contacte al administrador.
          </p>
          <Button asChild variant="outline">
            <Link href="/intranet/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}

function UnauthorizedReportState() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-950">
            Acceso no autorizado o informe no disponible
          </h1>
          <p className="text-sm text-slate-500">
            No tiene permisos asignados para visualizar este informe o el recurso
            se encuentra desactivado.
          </p>
        </div>
        <Button asChild>
          <Link href="/intranet/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Volver a mis informes
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
