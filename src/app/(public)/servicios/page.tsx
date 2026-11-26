import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getIconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Módulos y Solución",
  description:
    "Cinco módulos de control de gestión e informe mensual con IA sobre su ERP Softland. En marcha en 5 semanas.",
};

export default function ServiciosPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#0D1B2A] bg-dark-grid py-16 text-white lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F9D8A]">
            {siteConfig.modules.eyebrow} · {siteConfig.howItWorks.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {siteConfig.modules.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            {siteConfig.whatWeDo.title}. {siteConfig.howItWorks.footnote}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-16">
          {/* Detalle de los 5 Módulos */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {siteConfig.modules.items.map((mod) => {
              const Icon = getIconByName(mod.icon);
              return (
                <Card
                  key={mod.id}
                  className="flex flex-col justify-between border-slate-200/80 transition-all hover:border-[#0F9D8A]/40 hover:shadow-md"
                >
                  <CardContent className="p-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#0F9D8A]">
                        {mod.number}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B7A6B] text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-[#0D1B2A]">
                      {mod.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {mod.details}
                    </p>
                    <ul className="space-y-2 border-t border-slate-100 pt-4">
                      {mod.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-xs text-slate-700"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#0F9D8A]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}

            {/* Tarjeta Informe Mensual IA */}
            <Card className="border-[#0F9D8A]/30 bg-[#EBF7F5]">
              <CardContent className="p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0B7A6B]">
                    Incluido cada mes
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D1B2A] text-[#0F9D8A]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-[#0D1B2A]">
                  Informe mensual con IA
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {siteConfig.aiReport.title}. Cada afirmación enlaza a la cifra
                  que la respalda, sin exponer datos personales.
                </p>
                <ul className="space-y-2 border-t border-[#0F9D8A]/20 pt-4">
                  {siteConfig.aiReport.benefits.map((b) => (
                    <li
                      key={b.title}
                      className="flex items-center gap-2 text-xs text-slate-700"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#0B7A6B]" />
                      <span>
                        <strong>{b.title}:</strong> {b.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Cronograma 5 semanas */}
          <div className="rounded-2xl border border-slate-200 bg-[#F4F7F9] p-8 sm:p-10 space-y-8">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F9D8A]">
                {siteConfig.implementation.eyebrow}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0D1B2A]">
                {siteConfig.implementation.title}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {siteConfig.implementation.steps.map((step, idx) => (
                <div
                  key={step.phase}
                  className="rounded-xl border border-slate-200 bg-white p-5 space-y-2"
                >
                  <span className="inline-block rounded bg-[#EBF7F5] px-2 py-0.5 text-[11px] font-semibold text-[#0B7A6B]">
                    {step.week}
                  </span>
                  <h3 className="text-sm font-semibold text-[#0D1B2A]">
                    {idx + 1}. {step.phase}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#0D1B2A] p-8 text-white sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold">
                {siteConfig.nextStep.title}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                {siteConfig.nextStep.subtitle}
              </p>
            </div>
            <Button asChild variant="brand">
              <Link href="/contacto">
                Solicitar demo sin costo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
