import { redirect } from "next/navigation";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth";
import { getAuthorizedModuleById } from "@/services/modules.service";
import { ModuleError } from "@/modules/shared/ModuleError";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

const uuidSchema = z.string().uuid();

/**
 * Ruta de compatibilidad hacia atrás para enlaces antiguos /intranet/reportes/[id].
 * Resuelve el módulo equivalente en public.modules (que conserva el mismo UUID)
 * y redirige al visor universal /intranet/modulos/[slug].
 */
export default async function LegacyIntranetReportRedirectPage({
  params,
}: ReportPageProps) {
  const { profile } = await requireActiveUser();
  const { id } = await params;

  const validId = uuidSchema.safeParse(id);
  if (!validId.success) {
    return (
      <ModuleError
        title="Acceso no autorizado o módulo no disponible"
        description="El identificador solicitado no es válido o no tiene permisos para acceder."
      />
    );
  }

  const mod = await getAuthorizedModuleById(validId.data, profile);
  if (!mod) {
    return (
      <ModuleError
        title="Acceso no autorizado o informe no disponible"
        description="No tiene permisos asignados para visualizar este recurso o se encuentra desactivado."
      />
    );
  }

  redirect(`/intranet/modulos/${mod.slug}`);
}
