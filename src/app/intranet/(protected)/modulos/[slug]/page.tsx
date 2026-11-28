import type { Metadata } from "next";
import { requireActiveUser } from "@/lib/auth";
import { getAuthorizedModuleBySlug } from "@/services/modules.service";
import { moduleSlugSchema } from "@/lib/validators";
import { ModuleRenderer } from "@/modules/ModuleRenderer";
import { ModuleError } from "@/modules/shared/ModuleError";

interface ModulePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Módulo · ${slug}`,
  };
}

export default async function IntranetModuleViewerPage({
  params,
}: ModulePageProps) {
  const { profile } = await requireActiveUser();
  const { slug } = await params;

  const validSlug = moduleSlugSchema.safeParse(slug);
  if (!validSlug.success) {
    return (
      <ModuleError
        title="Módulo no válido"
        description="El identificador de módulo solicitado no tiene un formato válido."
      />
    );
  }

  // Validación doble: RLS en Supabase + permissions.service.ts
  const mod = await getAuthorizedModuleBySlug(validSlug.data, profile);

  if (!mod) {
    return (
      <ModuleError
        title="Acceso no autorizado o módulo no disponible"
        description="No cuenta con permisos asignados para visualizar este módulo o el recurso se encuentra desactivado."
      />
    );
  }

  return (
    <ModuleRenderer
      module={mod}
      profile={{
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
      }}
    />
  );
}
