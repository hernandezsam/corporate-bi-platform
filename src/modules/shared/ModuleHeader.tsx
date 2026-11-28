"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import type { CorporateModule } from "@/types/modules";
import { MODULE_TYPE_LABELS } from "@/types/modules";
import { getIconByName } from "@/lib/icons";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModuleHeaderProps {
  module: CorporateModule;
  isFullscreen: boolean;
  showDetails: boolean;
  onToggleDetails: () => void;
  onReload?: () => void;
  onToggleFullscreen: () => void;
  extraActions?: React.ReactNode;
}

export function ModuleHeader({
  module,
  isFullscreen,
  showDetails,
  onToggleDetails,
  onReload,
  onToggleFullscreen,
  extraActions,
}: ModuleHeaderProps) {
  const Icon = getIconByName(module.icon);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
          >
            <Link href="/intranet/dashboard" aria-label="Volver al catálogo">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#EBF7F5] text-[#0F7E73]">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <h1 className="truncate text-sm font-semibold text-[#0D1B2A]">
            {module.name}
          </h1>
          <Badge variant="amber" className="hidden text-[10px] sm:inline-flex">
            {MODULE_TYPE_LABELS[module.module_type]}
          </Badge>
          <Badge
            variant="secondary"
            className="hidden text-[10px] md:inline-flex"
          >
            {module.category}
          </Badge>
          <button
            type="button"
            onClick={onToggleDetails}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700",
              showDetails && "bg-[#FDF6EC] text-[#B97A35]"
            )}
            title="Ver detalles y fecha de actualización"
            aria-label="Ver detalles del módulo"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {extraActions}
          {onReload && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={onReload}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Recargar</span>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pantalla completa</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {showDetails && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>
            {module.description || "Módulo corporativo de Findex."}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Calendar className="h-3 w-3" />
            Actualizado: {formatDateTime(module.updated_at)}
          </span>
        </div>
      )}
    </div>
  );
}
