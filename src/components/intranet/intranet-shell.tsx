"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import type { Profile, Report } from "@/types/database";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIconByName } from "@/lib/icons";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface IntranetShellProps {
  profile: Profile;
  reports: Report[];
  children: React.ReactNode;
}

export function IntranetShell({
  profile,
  reports,
  children,
}: IntranetShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/intranet/login");
      router.refresh();
    }
  }

  const SidebarContent = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link href="/intranet/dashboard" onClick={() => setSidebarOpen(false)}>
          <BrandLogo variant="light" />
        </Link>
        <button
          type="button"
          className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navegación
          </p>
          <Link
            href="/intranet/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/intranet/dashboard"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Panel de Informes
          </Link>

          <Link
            href="/intranet/perfil"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/intranet/perfil"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>

          {profile.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/15 hover:text-blue-200"
            >
              <Shield className="h-4 w-4" />
              Panel de Administración
            </Link>
          )}
        </div>

        {/* Acceso rápido a informes asignados */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Mis Informes
            </p>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
              {reports.length}
            </span>
          </div>

          {reports.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">
              Sin informes asignados aún.
            </p>
          ) : (
            <div className="space-y-0.5">
              {reports.map((report) => {
                const Icon = getIconByName(report.icon);
                const href = `/intranet/reportes/${report.id}`;
                const active = pathname === href;
                return (
                  <Link
                    key={report.id}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "bg-blue-600/20 text-blue-200 border border-blue-500/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{report.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 p-4 space-y-2.5">
        <Link
          href="/"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <span>Sitio corporativo</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/80">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Sidebar Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw]">{SidebarContent}</div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Abrir menú lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Intranet Corporativa
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Portal de Informes Power BI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile.role === "ADMIN" && (
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <Link href="/admin">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                  Administración
                </Link>
              </Button>
            )}

            <Link
              href="/intranet/perfil"
              className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/70 py-1 pl-1.5 pr-3 transition-colors hover:bg-slate-100"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[11px]">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-none text-slate-900">
                  {profile.full_name}
                </p>
                <p className="mt-0.5 text-[10px] leading-none text-slate-500">
                  {profile.email}
                </p>
              </div>
              <Badge
                variant={profile.role === "ADMIN" ? "info" : "secondary"}
                className="text-[10px] px-1.5 py-0"
              >
                {profile.role}
              </Badge>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
