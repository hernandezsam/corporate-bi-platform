"use client";

import { useMemo, useState } from "react";
import type { CorporateProjectItem } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectsGalleryProps {
  projects: CorporateProjectItem[];
}

export function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  const [selectedSector, setSelectedSector] = useState<string>("Todos");

  const sectors = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.sector)));
    return ["Todos", ...unique];
  }, [projects]);

  const filtered = useMemo(() => {
    if (selectedSector === "Todos") return projects;
    return projects.filter((p) => p.sector === selectedSector);
  }, [projects, selectedSector]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {sectors.map((sector) => (
          <button
            key={sector}
            type="button"
            onClick={() => setSelectedSector(sector)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              selectedSector === sector
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {sector}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((project) => (
          <Card
            key={project.id}
            className="transition-all hover:border-slate-300 hover:shadow-md"
          >
            <CardContent className="p-7 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{project.sector}</Badge>
                <span className="text-xs font-medium text-slate-400">
                  {project.year}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {project.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Cliente: {project.client}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {project.summary}
              </p>
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-2.5 text-xs font-semibold text-blue-800">
                Resultado destacado: {project.metric}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
