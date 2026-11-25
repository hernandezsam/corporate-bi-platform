import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { ProjectsGallery } from "@/components/public/projects-gallery";

export const metadata: Metadata = {
  title: "Proyectos",
  description: `Portafolio de proyectos destacados ejecutados por ${siteConfig.companyName}.`,
};

export default function ProyectosPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-slate-200/80 bg-slate-50/70 bg-subtle-grid py-16 lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Portafolio Corporativo
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Proyectos destacados y casos de impacto medible
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Experiencia comprobada en control financiero, oficinas de proyectos y
            analítica ejecutiva para diversos sectores productivos.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <ProjectsGallery projects={siteConfig.projects} />
        </div>
      </section>
    </div>
  );
}
