import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { getAuthorizedCatalogModules } from "@/services/modules.service";
import { MODULE_TYPE_LABELS } from "@/types/modules";
import { ProfileForm } from "@/components/intranet/profile-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default async function IntranetPerfilPage() {
  const { profile } = await requireActiveUser();
  const availableModules = await getAuthorizedCatalogModules(profile.id);

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
          <CardTitle>Módulos habilitados en su cuenta</CardTitle>
          <CardDescription>
            Listado de informes, aplicaciones y herramientas a los que su
            usuario tiene acceso actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableModules.length === 0 ? (
            <p className="text-sm text-slate-500">
              No tiene módulos asignados actualmente.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableModules.map((mod) => (
                <Link
                  key={mod.id}
                  href={`/intranet/modulos/${mod.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#159F91]/40 hover:bg-[#EBF7F5]/60"
                >
                  <span>{mod.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {MODULE_TYPE_LABELS[mod.module_type]}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {mod.category}
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
