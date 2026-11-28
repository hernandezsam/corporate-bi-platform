import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FolderTree,
  LayoutGrid,
  Link2,
  Mail,
  Users,
} from "lucide-react";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { ContactMessage, Profile } from "@/types/database";
import {
  MODULE_TYPE_LABELS,
  type CorporateModule,
} from "@/types/modules";

export const metadata: Metadata = {
  title: "Panel de Administración",
};

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const [
    { data: profiles },
    { data: modules },
    { data: categories },
    { count: assignmentsCount },
    { data: recentContacts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("modules")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase.from("categories").select("id, active"),
    supabase
      .from("user_modules")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allProfiles = (profiles as Profile[]) ?? [];
  const allModules = (modules as CorporateModule[]) ?? [];
  const allCategories = categories ?? [];
  const contacts = (recentContacts as ContactMessage[]) ?? [];

  const activeUsers = allProfiles.filter((u) => u.active).length;
  const activeModules = allModules.filter((m) => m.active).length;
  const activeCategories = allCategories.filter((c) => c.active).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Resumen operativo de usuarios, módulos corporativos, categorías y
            permisos activos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/asignaciones">
              <Link2 className="h-4 w-4" />
              Gestionar asignaciones
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/modulos">
              <LayoutGrid className="h-4 w-4" />
              Gestionar módulos
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/usuarios">
              <Users className="h-4 w-4" />
              Gestionar usuarios
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Usuarios
              </p>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {allProfiles.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeUsers} activos · {allProfiles.length - activeUsers}{" "}
              desactivados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Módulos Corporativos
              </p>
              <LayoutGrid className="h-4 w-4 text-[#159F91]" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {allModules.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeModules} activos · {allModules.length - activeModules}{" "}
              inactivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Categorías
              </p>
              <FolderTree className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {allCategories.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeCategories} categorías activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Asignaciones
              </p>
              <Link2 className="h-4 w-4 text-[#D99A55]" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {assignmentsCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Vínculos usuario–módulo activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tablas recientes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Usuarios recientes</CardTitle>
              <CardDescription>
                Últimas cuentas registradas en el portal.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/usuarios">
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {allProfiles.length === 0 ? (
              <p className="text-sm text-slate-500">Sin usuarios registrados.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {allProfiles.slice(0, 5).map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/usuarios/${user.id}`}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/80 px-2 -mx-2 rounded-md"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {user.full_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={user.role === "ADMIN" ? "info" : "secondary"}
                      >
                        {user.role}
                      </Badge>
                      <Badge variant={user.active ? "success" : "destructive"}>
                        {user.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Módulos recientes</CardTitle>
              <CardDescription>
                Últimos módulos creados o actualizados en el catálogo.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/modulos">
                Gestionar
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {allModules.length === 0 ? (
              <p className="text-sm text-slate-500">Sin módulos registrados.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {allModules.slice(0, 5).map((mod) => (
                  <Link
                    key={mod.id}
                    href={`/admin/modulos/${mod.id}`}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/80 px-2 -mx-2 rounded-md"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {mod.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {MODULE_TYPE_LABELS[mod.module_type]} · {mod.category} ·{" "}
                        {formatDate(mod.updated_at)}
                      </p>
                    </div>
                    <Badge variant={mod.active ? "success" : "secondary"}>
                      {mod.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consultas recibidas desde el sitio público */}
      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#159F91]" />
              <CardTitle>Consultas recientes del sitio corporativo</CardTitle>
            </div>
            <CardDescription>
              Últimos mensajes recibidos a través del formulario público de
              contacto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {contacts.map((msg) => (
                <div key={msg.id} className="py-3 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {msg.subject}
                    </p>
                    <span className="text-xs text-slate-400">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {msg.full_name} ({msg.email})
                    {msg.company ? ` · ${msg.company}` : ""}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
