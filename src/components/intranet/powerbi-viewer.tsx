"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import type { Report } from "@/types/database";
import type { PowerBiEmbedConfig } from "@/services/powerbi.service";
import { getIconByName } from "@/lib/icons";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

interface PowerBiViewerProps {
  report: Report;
  embedConfig: PowerBiEmbedConfig;
  isAdmin: boolean;
}

export function PowerBiViewer({
  report,
  embedConfig,
  isAdmin,
}: PowerBiViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const Icon = getIconByName(report.icon);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function handleReload() {
    setLoading(true);
    setIframeKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Barra superior del visor */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 min-w-0">
          <Button asChild variant="outline" size="icon" className="shrink-0">
            <Link href="/intranet/dashboard" aria-label="Volver al dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-800">
                <Icon className="h-4 w-4" />
              </div>
              <h1 className="truncate text-lg font-semibold text-slate-950">
                {report.name}
              </h1>
              <Badge variant="secondary">{report.category}</Badge>
            </div>
            {report.description && (
              <p className="mt-1 text-xs text-slate-500">{report.description}</p>
            )}
            <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              Última actualización: {formatDateTime(report.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReload}>
            <RefreshCw className="h-3.5 w-3.5" />
            Recargar
          </Button>
          <Button variant="default" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                Salir
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                Pantalla completa
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Aviso de seguridad visible solo a administradores si la URL parece "Publish to web" */}
      {isAdmin && embedConfig.isPublicPublishToWebWarning && (
        <Alert variant="warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-xs leading-relaxed">
            <strong>Aviso de seguridad Power BI:</strong> La URL configurada
            parece corresponder a un enlace público (&quot;Publish to web&quot;).
            Para información corporativa confidencial utilice enlaces de inserción
            autenticados o Power BI Embedded con Microsoft Entra ID.
          </div>
        </Alert>
      )}

      {/* Contenedor Responsive del Iframe */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50/90 backdrop-blur-sm">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
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
          className="h-[calc(100vh-14.5rem)] min-h-[540px] w-full border-0"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
