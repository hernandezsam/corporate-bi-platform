import { Suspense } from "react";
import type { Metadata } from "next";
import { ShieldCheck, Lock, BarChart3 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LoginForm } from "@/components/intranet/login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión — Intranet",
  description: `Acceso privado a la intranet de informes Power BI de ${siteConfig.companyName}.`,
};

export default function IntranetLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="grid min-h-screen lg:grid-cols-12">
      {/* Panel lateral corporativo oscuro */}
      <div className="relative hidden flex-col justify-between bg-slate-950 p-10 text-white lg:col-span-5 lg:flex xl:p-14">
        <BrandLogo variant="light" showTagline />

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Entorno Corporativo Protegido
          </div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Portal privado de inteligencia de negocios y control de gestión
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Centraliza los tableros financieros, operacionales y de recursos
            humanos con control de acceso individual verificado en servidor.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5">
                <Lock className="h-4 w-4 text-blue-400" />
              </div>
              <span>Autenticación obligatoria y políticas Row Level Security (RLS)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <span>Visualización integrada y responsiva de informes Power BI</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} {siteConfig.legalName}
        </p>
      </div>

      {/* Formulario de acceso */}
      <div className="flex flex-col items-center justify-center bg-white px-6 py-12 lg:col-span-7">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <BrandLogo showTagline />
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}>
            <LoginForm supabaseConfigured={configured} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
