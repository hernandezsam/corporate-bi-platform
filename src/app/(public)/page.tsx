import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  Flag,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Table2,
  UserX,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { getIconByName } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function ProblemIcon({
  type,
  alert,
}: {
  type: "clock" | "spreadsheet" | "user-x";
  alert?: boolean;
}) {
  const bg = alert ? "bg-[#D99A55] text-[#0D1B2A]" : "bg-[#243B53] text-white";
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}
    >
      {type === "clock" && <Clock className="h-5 w-5" />}
      {type === "spreadsheet" && <Table2 className="h-5 w-5" />}
      {type === "user-x" && <UserX className="h-5 w-5" />}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* LÁMINA 1: HERO DARK NAVY + TURQUESA + ÁMBAR */}
      <section className="relative overflow-hidden bg-[#0D1B2A] bg-dark-grid text-white">
        <div className="container py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#159F91]">
                {siteConfig.hero.eyebrow}
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                Claridad financiera,{" "}
                <span className="text-[#D99A55]">cada semana</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {siteConfig.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="lg" variant="amber">
                  <Link href="/contacto">
                    {siteConfig.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:border-[#159F91] hover:bg-white/10 hover:text-white"
                >
                  <Link href="#modulos">{siteConfig.hero.secondaryCta}</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#159F91]" />
                  Sobre su ERP
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#159F91]" />
                  Sin licencias Power BI
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#D99A55]" />
                  Datos en Microsoft Azure Chile
                </span>
              </div>
            </div>

            {/* Motivo gráfico Findex (barras turquesa + barra pico ámbar) + Tarjeta "Lo que recibe" */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-white/10 bg-[#122437]/90 p-7 shadow-2xl backdrop-blur-sm">
                <div
                  className="mb-6 flex items-end justify-between border-b border-white/10 pb-6"
                  aria-hidden="true"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#159F91]">
                      {siteConfig.whatWeDo.whatYouReceiveTitle}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      Plan Completo · 5 módulos
                    </p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="h-7 w-4 rounded-md bg-[#114B4F]" />
                    <span className="h-11 w-4 rounded-md bg-[#159F91]" />
                    <span className="h-16 w-4 rounded-md bg-[#D99A55]" />
                  </div>
                </div>

                <ul className="space-y-3">
                  {siteConfig.whatWeDo.whatYouReceive.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-200"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#159F91]/20 text-[#159F91]">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-[#D99A55]/25 bg-[#0D1B2A]/85 px-4 py-3">
                  <div>
                    <p className="text-xs text-slate-400">Puesta en marcha</p>
                    <p className="text-sm font-semibold text-white">
                      <span className="text-[#D99A55]">5 semanas</span> · Sin
                      licencias Power BI
                    </p>
                  </div>
                  <Link
                    href="/intranet/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#159F91] transition-colors hover:text-[#D99A55]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Intranet
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LÁMINA 2: EL PROBLEMA */}
      <section className="border-b border-slate-200/80 bg-white py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
              {siteConfig.problem.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
              La gerencia se entera del margen cuando ya es{" "}
              <span className="text-[#B97A35]">tarde</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {siteConfig.problem.items.map((item) => (
              <Card
                key={item.title}
                className="border-slate-200/80 bg-[#F4F7F9] transition-colors hover:border-[#D99A55]/50"
              >
                <CardContent className="p-7 space-y-4">
                  <ProblemIcon type={item.icon} alert={item.alert} />
                  <h3 className="text-lg font-semibold text-[#0D1B2A]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Indicador de resultado destacado con acento ámbar */}
          <div className="rounded-xl border border-[#D99A55]/30 bg-[#FDF6EC] px-6 py-4 text-sm text-[#0D1B2A] sm:flex sm:items-center sm:gap-3">
            <span className="text-2xl font-bold tracking-tight text-[#B97A35]">
              {siteConfig.problem.statHighlight}
            </span>
            <span className="text-slate-700">{siteConfig.problem.statText}</span>
          </div>
        </div>
      </section>

      {/* LÁMINA 3: QUÉ HACEMOS */}
      <section className="border-b border-slate-200/80 bg-[#F8FAFB] py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
              {siteConfig.whatWeDo.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
              Arrendamos control de gestión con IA,{" "}
              <span className="text-[#159F91]">sobre su ERP</span>
            </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              {siteConfig.whatWeDo.pillars.map((pillar, idx) => {
                const Icon = getIconByName(pillar.icon);
                const isAmber = idx === 0 || idx === 3;
                return (
                  <div
                    key={pillar.title}
                    className="flex items-start gap-4 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition-colors hover:border-[#D99A55]/50"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        isAmber
                          ? "bg-[#D99A55] text-[#0D1B2A]"
                          : "bg-[#159F91] text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#0D1B2A]">
                        {pillar.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0D1B2A] p-8 text-white shadow-xl">
                <h3 className="text-xl font-semibold">
                  {siteConfig.whatWeDo.whatYouReceiveTitle}
                </h3>
                <ul className="mt-6 space-y-4">
                  {siteConfig.whatWeDo.whatYouReceive.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-200"
                    >
                      <Check className="h-4 w-4 shrink-0 text-[#D99A55]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-white/10 pt-6">
                  <Button asChild variant="brand" className="w-full">
                    <Link href="/servicios">
                      Explorar cómo funciona
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LÁMINA 4: CÓMO FUNCIONA */}
      <section className="border-b border-slate-200/80 bg-white py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
              {siteConfig.howItWorks.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
              Sus datos del ERP, convertidos en{" "}
              <span className="text-[#B97A35]">decisiones</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {siteConfig.howItWorks.steps.map((step, index) => {
              const Icon = getIconByName(step.icon);
              const isFinalStep = index === siteConfig.howItWorks.steps.length - 1;
              return (
                <div
                  key={step.title}
                  className={`relative rounded-xl border p-5 transition-all ${
                    step.featured
                      ? "border-[#0D1B2A] bg-[#0D1B2A] text-white shadow-lg"
                      : isFinalStep
                      ? "border-[#D99A55]/45 bg-[#FDF6EC] text-[#0D1B2A]"
                      : "border-slate-200/80 bg-[#F4F7F9] text-[#0D1B2A] hover:border-[#159F91]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        step.featured
                          ? "bg-[#159F91] text-white"
                          : isFinalStep
                          ? "bg-[#D99A55] text-[#0D1B2A]"
                          : "bg-[#243B53] text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        step.featured
                          ? "text-[#D99A55]"
                          : isFinalStep
                          ? "text-[#B97A35]"
                          : "text-slate-400"
                      }`}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      step.featured ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#159F91]/25 bg-[#EBF7F5] p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#B97A35]" />
              <div>
                <p className="text-sm font-semibold text-[#0F7E73]">
                  {siteConfig.howItWorks.aiBranchTitle}
                </p>
                <p className="text-sm text-slate-700">
                  {siteConfig.howItWorks.aiBranchText}
                </p>
              </div>
            </div>
            <p className="text-xs italic text-slate-600">
              {siteConfig.howItWorks.footnote}
            </p>
          </div>
        </div>
      </section>

      {/* LÁMINA 5: CINCO MÓDULOS */}
      <section
        id="modulos"
        className="border-b border-slate-200/80 bg-[#F8FAFB] py-20"
      >
        <div className="container space-y-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
                {siteConfig.modules.eyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
                Cinco módulos probados en{" "}
                <span className="text-[#159F91]">operación real</span>
              </h2>
            </div>
            <p className="text-xs font-medium text-slate-500">
              {siteConfig.modules.footnote}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {siteConfig.modules.items.map((mod, idx) => {
              const Icon = getIconByName(mod.icon);
              const isTinted = idx % 2 === 1;
              return (
                <Card
                  key={mod.id}
                  className={`flex flex-col justify-between border-slate-200/80 transition-all hover:border-[#D99A55]/70 hover:shadow-md ${
                    isTinted ? "bg-[#EBF7F5]/80" : "bg-white"
                  }`}
                >
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#B97A35]">
                        {mod.number}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#159F91] text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#0D1B2A]">
                        {mod.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {mod.summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* LÁMINA 6: INFORME MENSUAL CON IA */}
      <section className="border-b border-slate-200/80 bg-white py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
              {siteConfig.aiReport.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
              Cada mes, sus números explicados en{" "}
              <span className="text-[#B97A35]">simple</span>
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Tarjeta Ejemplo Ilustrativo */}
            <Card className="border-slate-200 bg-white shadow-sm lg:col-span-7">
              <CardContent className="p-7 space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {siteConfig.aiReport.sampleLabel}
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-[#0D1B2A]">
                    {siteConfig.aiReport.sampleHeading}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {siteConfig.aiReport.sampleSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#B97A35]">
                    Alertas
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    {siteConfig.aiReport.sampleAlerts.map((a) => (
                      <li key={a} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D99A55]" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#0F7E73]">
                    Recomendaciones
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    {siteConfig.aiReport.sampleRecommendations.map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#159F91]" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="border-t border-slate-100 pt-3 text-xs italic text-slate-500">
                  {siteConfig.aiReport.sampleFootnote}
                </p>
              </CardContent>
            </Card>

            {/* 3 Beneficios IA (turquesa + ámbar + marino) */}
            <div className="space-y-6 lg:col-span-5">
              {siteConfig.aiReport.benefits.map((b, idx) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      idx === 1
                        ? "bg-[#D99A55] text-[#0D1B2A]"
                        : idx === 2
                        ? "bg-[#0D1B2A] text-white"
                        : "bg-[#159F91] text-white"
                    }`}
                  >
                    {idx === 0 && <Eye className="h-5 w-5" />}
                    {idx === 1 && <Flag className="h-5 w-5" />}
                    {idx === 2 && <Shield className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#0D1B2A]">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LÁMINA 7: IMPLEMENTACIÓN EN 5 SEMANAS */}
      <section className="border-b border-slate-200/80 bg-[#F8FAFB] py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
              {siteConfig.implementation.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
              En marcha en{" "}
              <span className="text-[#B97A35]">5 semanas</span>, con cifras
              cuadradas antes de entregar
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {siteConfig.implementation.steps.map((step, i) => (
              <div key={step.phase} className="space-y-3">
                <div
                  className={`rounded-lg px-4 py-3 text-center text-sm font-semibold shadow-sm ${
                    i === 4
                      ? "bg-[#D99A55] text-[#0D1B2A]"
                      : "bg-[#159F91] text-white"
                  }`}
                >
                  {step.phase}
                </div>
                <div className="px-1">
                  <p
                    className={`text-xs font-semibold ${
                      i === 4 ? "text-[#B97A35]" : "text-[#0F7E73]"
                    }`}
                  >
                    {step.week}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white p-6">
              <h3 className="text-sm font-semibold text-[#0F7E73]">
                {siteConfig.implementation.neededFromYou.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {siteConfig.implementation.neededFromYou.description}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-6">
              <h3 className="text-sm font-semibold text-[#B97A35]">
                {siteConfig.implementation.afterGoLive.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {siteConfig.implementation.afterGoLive.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LÁMINA 8: SEGURIDAD EN CHILE */}
      <section className="border-b border-slate-200/80 bg-white py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
              {siteConfig.security.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
              Sus datos, protegidos y{" "}
              <span className="text-[#159F91]">en Chile</span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {siteConfig.security.items.map((item, idx) => {
              const Icon =
                item.icon === "KeyRound"
                  ? KeyRound
                  : item.icon === "Lock"
                  ? Lock
                  : item.icon === "ShieldCheck"
                  ? ShieldCheck
                  : getIconByName(item.icon);
              const isAmber = idx === 3;
              return (
                <Card
                  key={item.title}
                  className="border-slate-200/80 bg-[#F4F7F9] transition-colors hover:border-[#D99A55]/50"
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        isAmber
                          ? "bg-[#D99A55] text-[#0D1B2A]"
                          : "bg-[#159F91] text-white"
                      }`}
                    >
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
      </section>

      {/* LÁMINA 9 Y 10: COMPARATIVA + MODALIDAD Y PLANES */}
      <section className="border-b border-slate-200/80 bg-[#F8FAFB] py-20">
        <div className="container space-y-16">
          {/* Tabla Comparativa */}
          <div className="space-y-6">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
                {siteConfig.comparison.eyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
                Más rápido y económico que las{" "}
                <span className="text-[#B97A35]">alternativas</span>
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
                    <th className="border-t-2 border-[#D99A55] bg-[#159F91] px-5 py-4 text-center font-semibold text-white">
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
                      <td className="bg-[#EBF7F5]/80 px-5 py-4 text-center font-semibold text-[#0F7E73]">
                        {row.findex}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modalidad y Planes */}
          <div className="space-y-6">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
                {siteConfig.pricing.eyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
                {siteConfig.pricing.title}
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              <div className="rounded-2xl border border-[#D99A55]/25 bg-[#0D1B2A] p-8 text-white shadow-xl lg:col-span-6">
                <p className="text-sm font-medium text-slate-300">
                  {siteConfig.pricing.planName}
                </p>
                <p className="mt-4 text-3xl font-bold tracking-tight text-[#D99A55]">
                  {siteConfig.pricing.headline}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {siteConfig.pricing.subheadline}
                </p>

                <ul className="mt-7 space-y-3 border-t border-white/10 pt-6 text-sm text-slate-200">
                  {siteConfig.pricing.included.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#159F91]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button asChild variant="amber" size="lg" className="w-full">
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
                    <h3 className="text-base font-semibold text-[#0F7E73]">
                      {siteConfig.pricing.addonsTitle}
                    </h3>
                    <div className="mt-4 divide-y divide-slate-100">
                      {siteConfig.pricing.addons.map((addon) => (
                        <div
                          key={addon.label}
                          className="flex items-center justify-between gap-4 py-3.5 text-sm"
                        >
                          <span className="text-slate-700">{addon.label}</span>
                          <span className="shrink-0 text-xs font-semibold text-[#B97A35]">
                            {addon.detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-xl border border-[#159F91]/20 bg-[#EBF7F5] px-5 py-4 text-xs leading-relaxed text-slate-700">
                  {siteConfig.pricing.termsNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LÁMINA 11: EQUIPO */}
      <section className="border-b border-slate-200/80 bg-white py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159F91]">
              {siteConfig.team.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0D1B2A] sm:text-4xl">
              {siteConfig.team.title}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {siteConfig.team.members.map((member, idx) => {
              const Icon = getIconByName(member.icon);
              return (
                <Card
                  key={member.title}
                  className="border-slate-200/80 bg-[#F4F7F9] transition-colors hover:border-[#D99A55]/50"
                >
                  <CardContent className="p-7 space-y-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        idx === 0
                          ? "bg-[#D99A55] text-[#0D1B2A]"
                          : idx === 1
                          ? "bg-[#159F91] text-white"
                          : "bg-[#0D1B2A] text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0D1B2A]">
                      {member.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* LÁMINA 12: SIGUIENTE PASO (CTA FINAL) */}
      <section className="bg-[#0D1B2A] bg-dark-grid py-20 text-white">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#159F91]">
                {siteConfig.nextStep.eyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Veamos <span className="text-[#D99A55]">sus números</span>
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300">
                {siteConfig.nextStep.subtitle}
              </p>
              <div className="flex flex-wrap gap-3 pt-3">
                <Button asChild size="lg" variant="amber">
                  <Link href="/contacto">
                    Solicitar demo sin costo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:border-[#159F91] hover:bg-white/10 hover:text-white"
                >
                  <Link href="/intranet/login">
                    <Lock className="h-4 w-4 text-[#159F91]" />
                    Acceso Intranet
                  </Link>
                </Button>
              </div>
            </div>

            <div
              className="hidden justify-end lg:col-span-4 lg:flex"
              aria-hidden="true"
            >
              <div className="flex items-end gap-3.5">
                <span className="h-16 w-10 rounded-xl bg-[#114B4F]" />
                <span className="h-28 w-10 rounded-xl bg-[#159F91]" />
                <span className="h-40 w-10 rounded-xl bg-[#D99A55]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
