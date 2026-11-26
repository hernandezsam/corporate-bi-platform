"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import type { Report } from "@/types/database";
import type { PowerBiEmbedConfig } from "@/services/powerbi.service";
import { getIconByName } from "@/lib/icons";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PowerBiViewerProps {
  report: Report;
  embedConfig: PowerBiEmbedConfig;
}

export function PowerBiViewer({ report, embedConfig }: PowerBiViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const Icon = getIconByName(report.icon);

  // Mantener sincronizado el estado si el usuario sale de pantalla completa con ESC
  useEffect(() => {
    function handleFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  function handleReload() {
    setLoading(true);
    setIframeKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Barra compacta superior (máximo espacio vertical para Power BI) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
          >
            <Link href="/intranet/dashboard" aria-label="Volver al dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#EBF7F5] text-[#0B7A6B]">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <h1 className="truncate text-sm font-semibold text-[#0D1B2A]">
            {report.name}
          </h1>
          <Badge variant="secondary" className="hidden text-[11px] sm:inline-flex">
            {report.category}
          </Badge>
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700",
              showDetails && "bg-slate-100 text-[#0B7A6B]"
            )}
            title="Ver detalles y fecha de actualización"
            aria-label="Ver detalles del informe"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={handleReload}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Recargar</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={toggleFullscreen}
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

      {/* Detalles desplegables bajo demanda (0px por defecto) */}
      {showDetails && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>
            {report.description ||
              "Informe corporativo de control de gestión."}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Calendar className="h-3 w-3" />
            Actualizado: {formatDateTime(report.updated_at)}
          </span>
        </div>
      )}

      {/* Contenedor maximizado del Iframe (borde a borde) */}
      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 overflow-hidden bg-white",
          isFullscreen
            ? "h-screen w-screen rounded-none border-0"
            : "rounded-lg border border-slate-200 shadow-sm"
        )}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50/90 backdrop-blur-sm">
            <Loader2 className="h-7 w-7 animate-spin text-[#0F9D8A]" />
            <p className="text-xs font-medium text-slate-600">
              Cargando informe de Power BI...
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          title={report.name}
          src={embedConfig.embedUrl}
          onLoad={() => setLoading(false)}
          className={cn(
            "w-full border-0",
            isFullscreen
              ? "h-screen"
              : "h-[calc(100vh-6.25rem)] min-h-[580px]"
          )}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
