import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { getIconByName } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Corporativo */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-50/60 bg-subtle-grid">
        <div className="container py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7 animate-fade-in">
              <Badge variant="outline" className="bg-white px-3 py-1 text-slate-700 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                {siteConfig.hero.badge}
              </Badge>

              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
                {siteConfig.hero.title}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {siteConfig.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="lg" variant="default">
                  <Link href="/contacto">
                    {siteConfig.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/servicios">{siteConfig.hero.secondaryCta}</Link>
                </Button>
              </div>
            </div>

            {/* Panel visual ejecutivo minimalista */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Ecosistema Corporativo
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      Control de Gestión en Tiempo Real
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Operativo
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs text-slate-500">Adherencia Presupuestaria</p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
                      98.4%
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      +2.1% vs trimestre anterior
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs text-slate-500">Informes Activos</p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
                      100% RLS
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Acceso segmentado por perfil
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 rounded-xl border border-slate-100 bg-slate-950 p-4 text-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">
                      Intranet Privada Power BI
                    </span>
                    <Lock className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Portal corporativo exclusivo para colaboradores y directores con
                    control granular de permisos por usuario e informe.
                  </p>
                  <Link
                    href="/intranet/login"
                    className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    Ingresar a la intranet
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indicadores Corporativos */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="container py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-5"
              >
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Quiénes Somos
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                {siteConfig.about.title}
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                {siteConfig.about.lead}
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                {siteConfig.about.story}
              </p>
              <div className="pt-2">
                <Button asChild variant="outline">
                  <Link href="/nosotros">
                    Conocer nuestra historia y propósito
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
              <Card className="bg-slate-50/50">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Misión
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {siteConfig.about.mission}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50/50">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Visión
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {siteConfig.about.vision}
                  </p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2">
                <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
                  {siteConfig.about.values.map((val) => (
                    <div key={val.title} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {val.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {val.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="border-y border-slate-200/80 bg-slate-50/60 py-20">
        <div className="container">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Capacidades y Servicios
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                Soluciones diseñadas para el control y crecimiento corporativo
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/servicios">
                Ver todos los servicios
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {siteConfig.services.map((service) => {
              const Icon = getIconByName(service.icon);
              return (
                <Card
                  key={service.id}
                  className="transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {service.summary}
                    </p>
                    <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                      {service.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-xs text-slate-600"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Proyectos Destacados
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                Resultados concretos en industrias exigentes
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/proyectos">
                Explorar portafolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {siteConfig.projects.slice(0, 4).map((project) => (
              <Card key={project.id} className="flex flex-col justify-between">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{project.sector}</Badge>
                    <span className="text-xs font-medium text-slate-400">
                      {project.year}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {project.client}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {project.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold text-blue-700">
                      Impacto: {project.metric}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Contacto + Intranet */}
      <section className="border-t border-slate-200/80 bg-slate-50 py-16">
        <div className="container">
          <div className="rounded-2xl bg-slate-950 px-6 py-12 text-white sm:px-12">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  ¿Necesita fortalecer el control de gestión de su organización?
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Converse con nuestro equipo de consultores e ingenieros o ingrese
                  directamente a la intranet corporativa si ya dispone de cuenta.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="brand">
                  <Link href="/contacto">
                    Contactar equipo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/intranet/login">
                    <Lock className="h-4 w-4" />
                    Acceso Intranet
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
