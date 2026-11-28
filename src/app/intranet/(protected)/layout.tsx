import { requireActiveUser } from "@/lib/auth";
import { getAuthorizedSidebarModules } from "@/services/modules.service";
import { IntranetShell } from "@/components/intranet/intranet-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedIntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireActiveUser();

  // Mínimo privilegio en payload RSC: solo metadatos necesarios para el menú lateral
  // (no se serializa source_url en el layout global).
  const modules = await getAuthorizedSidebarModules();

  return (
    <IntranetShell profile={profile} modules={modules}>
      {children}
    </IntranetShell>
  );
}
