"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  FolderOpen,
  Maximize2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { Profile, Report } from "@/types/database";
import { getIconByName } from "@/lib/icons";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface DashboardWorkspaceProps {
  profile: Profile;
  reports: Report[];
  forbiddenNotice?: boolean;
}

export function DashboardWorkspace({
  profile,
  reports,
  forbiddenNotice = false,
}: DashboardWorkspaceProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [quickPreviewReport, setQuickPreviewReport] = useState<Report | null>(
    null
  );

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(reports.map((r) => r.category || "General"))
    );
    return ["Todas", ...unique];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesCategory =
        selectedCategory === "Todas" ||
        (report.category || "General") === selectedCategory;
      const matchesSearch =
        !term ||
        report.name.toLowerCase().includes(term) ||
        (report.description || "").toLowerCase().includes(term) ||
        (report.category || "").toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [reports, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {forbiddenNotice && (
        <Alert variant="warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            No cuenta con permisos de administrador para acceder a la sección
            solicitada.
          </span>
        </Alert>
      )}

      {/* Encabezado de bienvenida */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Hola, {profile.full_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile.role === "ADMIN"
              ? "Visualice los informes activos de la organización o gestiónelos desde el panel administrativo."
              : "Seleccione un informe autorizado para visualizarlo en el área integrada."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white py-1 px-3 text-xs">
            {reports.length}{" "}
            {reports.length === 1
              ? "informe disponible"
              : "informes disponibles"}
          </Badge>
        </div>
      </div>

      {/* Buscador y filtros de categoría */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar informe por nombre o descripción..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selectedCategory === cat
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Área de visualización integrada rápida (maximizada) */}
      {quickPreviewReport && (
        <Card className="overflow-hidden border-slate-300 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#0D1B2A] px-4 py-2 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#0F9D8A]" />
              <p className="truncate text-sm font-semibold">
                {quickPreviewReport.name}
              </p>
              <span className="hidden text-[11px] text-slate-400 sm:inline">
                · {quickPreviewReport.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="brand"
                className="h-7 px-2.5 text-xs"
              >
                <Link href={`/intranet/reportes/${quickPreviewReport.id}`}>
                  <Maximize2 className="h-3.5 w-3.5" />
                  Ampliar vista
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => setQuickPreviewReport(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar visor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="relative h-[82vh] min-h-[600px] w-full bg-slate-100">
            <iframe
              title={quickPreviewReport.name}
              src={quickPreviewReport.powerbi_url}
              className="h-full w-full border-0"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </Card>
      )}

      {/* Listado de Tarjetas de Informes */}
      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              No tiene informes asignados
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Actualmente su perfil no cuenta con informes activos asignados.
              Solicite acceso a su administrador corporativo.
            </p>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              No se encontraron informes que coincidan con su búsqueda.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSearch("");
                setSelectedCategory("Todas");
              }}
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report) => {
            const Icon = getIconByName(report.icon);
            const isPreviewing = quickPreviewReport?.id === report.id;

            return (
              <Card
                key={report.id}
                className={cn(
                  "flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-md",
                  isPreviewing && "ring-2 ring-blue-600/30 border-blue-500"
                )}
              >
                <CardContent className="flex h-full flex-col justify-between p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary">{report.category}</Badge>
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-slate-950">
                        {report.name}
                      </h2>
                      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {report.description ||
                          "Informe corporativo de inteligencia de negocios."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Actualizado: {formatDate(report.updated_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild className="flex-1" size="sm">
                        <Link href={`/intranet/reportes/${report.id}`}>
                          Visualizar informe
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setQuickPreviewReport(isPreviewing ? null : report)
                        }
                      >
                        {isPreviewing ? "Ocultar" : "Aquí"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
