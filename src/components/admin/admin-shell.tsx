"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  FolderTree,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Shield,
  Users,
  X,
} from "lucide-react";
import type { Profile } from "@/types/database";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AdminShellProps {
  profile: Profile;
  children: React.ReactNode;
}

const ADMIN_NAV = [
  { label: "Resumen", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Gestión de Informes", href: "/admin/informes", icon: BarChart3 },
  { label: "Categorías", href: "/admin/categorias", icon: FolderTree },
  { label: "Asignaciones", href: "/admin/asignaciones", icon: Link2 },
];

export function AdminShell({ profile, children }: AdminShellProps) {
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
        <Link href="/admin" onClick={() => setSidebarOpen(false)}>
          <BrandLogo variant="light" />
        </Link>
        <button
          type="button"
          className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span>Consola de Administración</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-2">
        <Link
          href="/intranet/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a la Intranet
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/80">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw]">{SidebarContent}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Administración
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Gobierno de Usuarios, Informes y Permisos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/intranet/dashboard">Ver Intranet</Link>
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1.5 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[11px]">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium text-slate-800 sm:inline">
                {profile.full_name}
              </span>
              <Badge variant="info" className="text-[10px] px-1.5 py-0">
                ADMIN
              </Badge>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
