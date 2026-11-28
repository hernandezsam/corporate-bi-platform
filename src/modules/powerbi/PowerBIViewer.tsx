"use client";

import { useState } from "react";
import type { CorporateModule } from "@/types/modules";
import { isSafeIframeUrl } from "@/services/powerbi.service";
import { cn } from "@/lib/utils";
import { ModuleLoading } from "@/modules/shared/ModuleLoading";
import { ModuleError } from "@/modules/shared/ModuleError";

interface PowerBIViewerProps {
  module: CorporateModule;
  reloadKey: number;
  isFullscreen: boolean;
}

export function PowerBIViewer({
  module,
  reloadKey,
  isFullscreen,
}: PowerBIViewerProps) {
  const [loading, setLoading] = useState(true);
  const url = module.source_url || "";

  if (!url || !isSafeIframeUrl(url)) {
    return (
      <ModuleError
        title="URL de Power BI no autorizada"
        description="La dirección configurada para este informe no pertenece a un dominio HTTPS autorizado de Power BI (*.powerbi.com / *.fabric.microsoft.com)."
      />
    );
  }

  return (
    <div className="relative h-full w-full bg-white">
      {loading && (
        <div className="absolute inset-0 z-10">
          <ModuleLoading label="Cargando informe de Power BI..." />
        </div>
      )}
      <iframe
        key={reloadKey}
        title={module.name}
        src={url}
        onLoad={() => setLoading(false)}
        className={cn(
          "w-full border-0",
          isFullscreen ? "h-screen" : "h-[calc(100vh-6.25rem)] min-h-[580px]"
        )}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
