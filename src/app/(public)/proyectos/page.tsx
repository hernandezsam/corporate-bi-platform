import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Planes y Modalidad",
  description:
    "Servicio integral de control de gestión con IA en modalidad de arriendo mensual, con 5 módulos, intranet con su marca y sin licencias Power BI.",
};

export default function PlanesPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#0D1B2A] bg-dark-grid py-16 text-white lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F9D8A]">
            {siteConfig.pricing.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {siteConfig.pricing.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            Arriendo mensual transparente con implementación en 5 semanas, datos
            en Chile y sin licencias Power BI adicionales para sus usuarios.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-16">
          {/* Plan Completo + Opcionales */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="rounded-2xl bg-[#0D1B2A] p-8 text-white shadow-xl lg:col-span-6">
              <p className="text-sm font-medium text-slate-300">
                {siteConfig.pricing.planName}
              </p>
              <p className="mt-4 text-3xl font-bold tracking-tight text-[#0F9D8A]">
                {siteConfig.pricing.headline}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {siteConfig.pricing.subheadline}
              </p>

              <ul className="mt-7 space-y-3 border-t border-white/10 pt-6 text-sm text-slate-200">
                {siteConfig.pricing.included.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#0F9D8A]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button asChild variant="brand" size="lg" className="w-full">
                  <Link href="/contacto">
                    Solicitar propuesta y demo gratuita
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-6">
              <Card>
                <CardContent className="p-7">
                  <h2 className="text-lg font-semibold text-[#0B7A6B]">
                    {siteConfig.pricing.addonsTitle}
                  </h2>
                  <div className="mt-4 divide-y divide-slate-100">
                    {siteConfig.pricing.addons.map((addon) => (
                      <div
                        key={addon.label}
                        className="flex items-center justify-between gap-4 py-4 text-sm"
                      >
                        <span className="text-slate-700">{addon.label}</span>
                        <span className="shrink-0 text-xs font-semibold text-[#0B7A6B]">
                          {addon.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-xl bg-[#EBF7F5] px-5 py-4 text-xs leading-relaxed text-slate-700">
                {siteConfig.pricing.termsNote}
              </div>
            </div>
          </div>

          {/* Tabla Comparativa */}
          <div className="space-y-6">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F9D8A]">
                {siteConfig.comparison.eyebrow}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0D1B2A] sm:text-3xl">
                {siteConfig.comparison.title}
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="bg-[#0D1B2A] text-white">
                    <th className="px-5 py-4 font-medium" />
                    <th className="px-4 py-4 text-center font-semibold">
                      Excel interno
                    </th>
                    <th className="px-4 py-4 text-center font-semibold">
                      Analista propio
                    </th>
                    <th className="px-4 py-4 text-center font-semibold">
                      Consultora a medida
                    </th>
                    <th className="bg-[#0F9D8A] px-5 py-4 text-center font-semibold text-white">
                      Findex
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {siteConfig.comparison.rows.map((row, idx) => (
                    <tr
                      key={row.criterion}
                      className={idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}
                    >
                      <td className="px-5 py-4 font-semibold text-[#0D1B2A]">
                        {row.criterion}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">
                        {row.excel}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">
                        {row.analyst}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">
                        {row.consulting}
                      </td>
                      <td className="bg-[#EBF7F5]/80 px-5 py-4 text-center font-semibold text-[#0B7A6B]">
                        {row.findex}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
