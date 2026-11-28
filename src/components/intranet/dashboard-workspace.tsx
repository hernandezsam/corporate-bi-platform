"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  FolderOpen,
  Search,
  Star,
} from "lucide-react";
import type { Profile } from "@/types/database";
import {
  MODULE_TYPE_LABELS,
  type ModuleCatalogItem,
  type ModuleType,
} from "@/types/modules";
import { getIconByName } from "@/lib/icons";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface DashboardWorkspaceProps {
  profile: Profile;
  initialModules: ModuleCatalogItem[];
  forbiddenNotice?: boolean;
}

const TYPE_STYLES: Record<
  ModuleType,
  { badge: string; iconBg: string }
> = {
  POWERBI: {
    badge: "border-[#0D1B2A]/20 bg-[#0D1B2A]/5 text-[#0D1B2A]",
    iconBg: "border-slate-200 bg-slate-50 text-[#0D1B2A]",
  },
  APP: {
    badge: "border-[#159F91]/30 bg-[#EBF7F5] text-[#0F7E73]",
    iconBg: "border-[#159F91]/30 bg-[#EBF7F5] text-[#0F7E73]",
  },
  TOOL: {
    badge: "border-[#D99A55]/40 bg-[#FDF6EC] text-[#B97A35]",
    iconBg: "border-[#D99A55]/40 bg-[#FDF6EC] text-[#B97A35]",
  },
  HTML: {
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
    iconBg: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  PDF: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    iconBg: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function DashboardWorkspace({
  profile,
  initialModules,
  forbiddenNotice = false,
}: DashboardWorkspaceProps) {
  const [modules, setModules] = useState<ModuleCatalogItem[]>(initialModules);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [togglingFavId, setTogglingFavId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(modules.map((m) => m.category || "General"))
    );
    return ["Todas", ...unique];
  }, [modules]);

  const availableTypes = useMemo(() => {
    const unique = Array.from(new Set(modules.map((m) => m.module_type)));
    return unique;
  }, [modules]);

  const favoritesCount = useMemo(
    () => modules.filter((m) => m.is_favorite).length,
    [modules]
  );

  const filteredModules = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = modules.filter((mod) => {
      if (onlyFavorites && !mod.is_favorite) return false;
      const matchesCategory =
        selectedCategory === "Todas" ||
        (mod.category || "General") === selectedCategory;
      const matchesType =
        selectedType === "ALL" || mod.module_type === selectedType;
      const matchesSearch =
        !term ||
        mod.name.toLowerCase().includes(term) ||
        (mod.description || "").toLowerCase().includes(term) ||
        (mod.category || "").toLowerCase().includes(term) ||
        MODULE_TYPE_LABELS[mod.module_type].toLowerCase().includes(term);
      return matchesCategory && matchesType && matchesSearch;
    });

    // Priorizar favoritos al inicio manteniendo sort_order relativo
    return [...list].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.name.localeCompare(b.name);
    });
  }, [modules, search, selectedCategory, selectedType, onlyFavorites]);

  async function toggleFavorite(mod: ModuleCatalogItem) {
    if (togglingFavId) return;
    const nextVal = !mod.is_favorite;
    setTogglingFavId(mod.id);

    // Actualización optimista
    setModules((prev) =>
      prev.map((m) => (m.id === mod.id ? { ...m, is_favorite: nextVal } : m))
    );

    try {
      const res = await fetch("/api/modules/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module_id: mod.id, is_favorite: nextVal }),
      });
      if (!res.ok) {
        // Revertir si falla
        setModules((prev) =>
          prev.map((m) =>
            m.id === mod.id ? { ...m, is_favorite: !nextVal } : m
          )
        );
      }
    } catch {
      setModules((prev) =>
        prev.map((m) =>
          m.id === mod.id ? { ...m, is_favorite: !nextVal } : m
        )
      );
    } finally {
      setTogglingFavId(null);
    }
  }

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
          <h1 className="text-2xl font-semibold tracking-tight text-[#0D1B2A]">
            Hola, {profile.full_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile.role === "ADMIN"
              ? "Acceda al catálogo completo de informes Power BI, aplicaciones financieras y herramientas corporativas, o gestiónelos en Administración."
              : "Seleccione un módulo autorizado para abrirlo en el entorno corporativo de Findex."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-white py-1 px-3 text-xs">
            {modules.length}{" "}
            {modules.length === 1
              ? "módulo disponible"
              : "módulos disponibles"}
          </Badge>
          {favoritesCount > 0 && (
            <Badge className="border border-[#D99A55]/40 bg-[#FDF6EC] py-1 px-3 text-xs text-[#B97A35] hover:bg-[#FDF6EC]">
              <Star className="mr-1 h-3 w-3 fill-[#D99A55] text-[#D99A55]" />
              {favoritesCount} {favoritesCount === 1 ? "favorito" : "favoritos"}
            </Badge>
          )}
        </div>
      </div>

      {/* Buscador y filtros */}
      <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar módulo por nombre, tipo o descripción..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOnlyFavorites((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                onlyFavorites
                  ? "border-[#D99A55] bg-[#FDF6EC] text-[#B97A35]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#D99A55]/50 hover:bg-slate-100"
              )}
            >
              <Star
                className={cn(
                  "h-3 w-3",
                  onlyFavorites
                    ? "fill-[#D99A55] text-[#D99A55]"
                    : "text-slate-400"
                )}
              />
              Favoritos
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selectedCategory === cat
                    ? "border-[#D99A55] bg-[#0D1B2A] text-[#F6D3A5]"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#D99A55]/50 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por tipo de módulo (solo se muestra cuando hay más de un tipo) */}
        {availableTypes.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tipo:
            </span>
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className={cn(
                "rounded-md border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                selectedType === "ALL"
                  ? "border-[#159F91] bg-[#EBF7F5] text-[#0F7E73]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              Todos
            </button>
            {availableTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  "rounded-md border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  selectedType === type
                    ? "border-[#159F91] bg-[#EBF7F5] text-[#0F7E73]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {MODULE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Catálogo de Tarjetas de Módulos */}
      {modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              No tiene módulos asignados
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Actualmente su perfil no cuenta con módulos activos asignados.
              Solicite acceso a su administrador corporativo.
            </p>
          </CardContent>
        </Card>
      ) : filteredModules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              No se encontraron módulos que coincidan con los filtros aplicados.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSearch("");
                setSelectedCategory("Todas");
                setSelectedType("ALL");
                setOnlyFavorites(false);
              }}
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredModules.map((mod) => {
            const Icon = getIconByName(mod.icon);
            const styles = TYPE_STYLES[mod.module_type] ?? TYPE_STYLES.POWERBI;

            return (
              <Card
                key={mod.id}
                className="group flex flex-col justify-between border-slate-200/90 transition-all hover:border-[#159F91]/40 hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col justify-between p-6">
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg border",
                          styles.iconBg
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-semibold", styles.badge)}
                        >
                          {MODULE_TYPE_LABELS[mod.module_type]}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(mod)}
                          disabled={togglingFavId === mod.id}
                          title={
                            mod.is_favorite
                              ? "Quitar de favoritos"
                              : "Marcar como favorito"
                          }
                          aria-label={
                            mod.is_favorite
                              ? "Quitar de favoritos"
                              : "Marcar como favorito"
                          }
                          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#D99A55]"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              mod.is_favorite &&
                                "fill-[#D99A55] text-[#D99A55]"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {mod.category}
                        </span>
                      </div>
                      <h2 className="mt-0.5 text-base font-semibold text-[#0D1B2A] group-hover:text-[#0F7E73] transition-colors">
                        {mod.name}
                      </h2>
                      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {mod.description ||
                          "Módulo corporativo integrado en la intranet de Findex."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Actualizado: {formatDate(mod.updated_at)}</span>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-[#0D1B2A] text-white hover:bg-[#159F91]"
                    >
                      <Link href={`/intranet/modulos/${mod.slug}`}>
                        Abrir módulo
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
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
