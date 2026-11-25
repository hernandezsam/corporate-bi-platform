import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, Eye } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nosotros",
  description: `Conozca la historia, misión, visión y valores de ${siteConfig.companyName}.`,
};

export default function NosotrosPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-slate-200/80 bg-slate-50/70 bg-subtle-grid py-16 lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Quiénes Somos
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {siteConfig.about.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            {siteConfig.about.lead}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-12">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-8 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Compass className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-950">Misión</h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {siteConfig.about.mission}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Eye className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-950">Visión</h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {siteConfig.about.vision}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8">
            <h2 className="text-xl font-semibold text-slate-950">
              Nuestra Trayectoria
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              {siteConfig.about.story}
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {siteConfig.stats.map((stat) => (
                <div key={stat.label} className="border-l-2 border-slate-900 pl-4">
                  <p className="text-2xl font-semibold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-slate-800">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Principios y Valores Corporativos
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {siteConfig.about.values.map((val) => (
                <Card key={val.title}>
                  <CardContent className="p-6 space-y-2.5">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-semibold text-slate-900">
                      {val.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {val.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                ¿Desea conocer cómo trabajamos con su equipo?
              </h3>
              <p className="text-sm text-slate-500">
                Coordinemos una reunión de diagnóstico inicial sin compromiso.
              </p>
            </div>
            <Button asChild>
              <Link href="/contacto">
                Contactar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
