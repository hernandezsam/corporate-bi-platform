import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getIconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Equipo y Seguridad",
  description:
    "Conozca al equipo multidisciplinario de Findex y nuestras garantías de seguridad y cumplimiento con la Ley N° 21.719 en Chile.",
};

export default function NosotrosPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#0D1B2A] bg-dark-grid py-16 text-white lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F9D8A]">
            {siteConfig.team.eyebrow} · {siteConfig.security.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {siteConfig.team.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            {siteConfig.team.lead}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-16">
          {/* Equipo */}
          <div className="grid gap-6 md:grid-cols-3">
            {siteConfig.team.members.map((member, idx) => {
              const Icon = getIconByName(member.icon);
              return (
                <Card
                  key={member.title}
                  className="border-slate-200/80 bg-[#F4F7F9]"
                >
                  <CardContent className="p-8 space-y-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                        idx === 1 ? "bg-[#0B665A]" : "bg-[#0F9D8A]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#0D1B2A]">
                      {member.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Seguridad en Chile */}
          <div className="space-y-6">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F9D8A]">
                {siteConfig.security.eyebrow}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0D1B2A] sm:text-3xl">
                {siteConfig.security.title}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {siteConfig.security.items.map((item) => {
                const Icon =
                  item.icon === "KeyRound"
                    ? KeyRound
                    : item.icon === "Lock"
                    ? Lock
                    : item.icon === "ShieldCheck"
                    ? ShieldCheck
                    : getIconByName(item.icon);
                return (
                  <Card key={item.title} className="border-slate-200/80 bg-white">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F9D8A] text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#0D1B2A]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-[#EBF7F5] p-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-[#0D1B2A]">
                {siteConfig.nextStep.title}
              </h3>
              <p className="mt-1 text-sm text-slate-700">
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
