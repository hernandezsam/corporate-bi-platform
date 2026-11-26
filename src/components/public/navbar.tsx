"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="focus:outline-none">
          <BrandLogo variant="dark" size="md" />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegación principal"
        >
          {siteConfig.navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#EBF7F5] text-[#0B7A6B]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0D1B2A]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Button asChild variant="ghost" size="sm" className="h-9 px-3.5 text-xs">
            <Link href="/contacto">Solicitar demo</Link>
          </Button>
          <Button asChild variant="default" size="sm" className="h-9 px-4">
            <Link href="/intranet/login">
              <Lock className="h-3.5 w-3.5 text-[#0F9D8A]" />
              Acceso Intranet
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-[#0D1B2A] lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Abrir menú de navegación"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col space-y-1">
            {siteConfig.navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-[#EBF7F5] text-[#0B7A6B]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0D1B2A]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-3">
              <Button
                asChild
                variant="brand"
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                <Link href="/contacto">Solicitar demo sin costo</Link>
              </Button>
              <Button
                asChild
                variant="default"
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                <Link href="/intranet/login">
                  <Lock className="h-4 w-4 text-[#0F9D8A]" />
                  Acceso Intranet
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
