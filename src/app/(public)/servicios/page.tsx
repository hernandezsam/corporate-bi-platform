import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getIconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Servicios",
  description: `Servicios de ingeniería, gestión de proyectos y analítica de ${siteConfig.companyName}.`,
};

const METHODOLOGY_STEPS = [
  {
    step: "01",
    title: "Diagnóstico y Levantamiento",
    description:
      "Evaluamos procesos críticos, fuentes de datos y brechas de control financiero u operacional.",
  },
  {
    step: "02",
    title: "Arquitectura y Diseño",
    description:
      "Definimos indicadores clave, modelos de gobierno y flujos de información trazables.",
  },
  {
    step: "03",
    title: "Implementación y Despliegue",
    description:
      "Ponemos en producción tableros, controles y rutinas gerenciales junto a sus equipos.",
  },
  {
    step: "04",
    title: "Acompañamiento Continuo",
    description:
      "Monitoreo de adopción, evolución de métricas y soporte ejecutivo permanente.",
  },
];

export default function ServiciosPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-slate-200/80 bg-slate-50/70 bg-subtle-grid py-16 lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Servicios Corporativos
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Capacidades integradas para dirección financiera, operacional y de proyectos
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Combinamos experiencia técnica con plataformas de inteligencia de negocios
            para entregar visibilidad ejecutiva confiable.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-16">
          <div className="grid gap-6 md:grid-cols-2">
            {siteConfig.services.map((service) => {
              const Icon = getIconByName(service.icon);
              return (
                <Card key={service.id} className="flex flex-col justify-between">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      {service.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {service.description}
                    </p>
                    <ul className="space-y-2 border-t border-slate-100 pt-4">
                      {service.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2.5 text-sm text-slate-700"
                        >
                          <Check className="h-4 w-4 text-blue-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Metodología de Trabajo
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Un proceso estructurado de principio a fin
              </h2>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {METHODOLOGY_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200/80 bg-white p-5"
                >
                  <span className="text-xs font-semibold text-blue-600">
                    {item.step}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-slate-950 p-8 text-white sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold">
                Solicite una propuesta adaptada a su organización
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Nuestro equipo responde en menos de 24 horas hábiles.
              </p>
            </div>
            <Button asChild variant="brand">
              <Link href="/contacto">
                Solicitar reunión
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
