"use client";

import { useState } from "react";
import type { CorporateModule } from "@/types/modules";
import { isAllowedDocumentUrl } from "@/lib/security";
import { cn } from "@/lib/utils";
import { ModuleLoading } from "@/modules/shared/ModuleLoading";
import { ModuleError } from "@/modules/shared/ModuleError";

interface PDFViewerProps {
  module: CorporateModule;
  reloadKey: number;
  isFullscreen: boolean;
}

export function PDFViewer({
  module,
  reloadKey,
  isFullscreen,
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const rawUrl = module.source_url || "";

  if (!rawUrl || !isAllowedDocumentUrl(rawUrl)) {
    return (
      <ModuleError
        title="Documento PDF no autorizado"
        description="La ubicación del documento debe utilizar HTTPS y provenir de Supabase Storage o de un dominio registrado en ALLOWED_DOCUMENT_HOSTS."
      />
    );
  }

  const showToolbar = module.config?.open_toolbar !== false;
  const allowDownload = Boolean(module.config?.allow_download);
  const toolbarFlag = showToolbar && allowDownload ? "1" : "0";
  const viewerUrl = rawUrl.includes("#")
    ? rawUrl
    : `${rawUrl}#toolbar=${toolbarFlag}&navpanes=0&view=FitH`;

  return (
    <div className="relative h-full w-full bg-slate-100">
      {loading && (
        <div className="absolute inset-0 z-10">
          <ModuleLoading label="Cargando documento PDF..." />
        </div>
      )}
      <iframe
        key={reloadKey}
        title={module.name}
        src={viewerUrl}
        onLoad={() => setLoading(false)}
        referrerPolicy="no-referrer"
        className={cn(
          "w-full border-0",
          isFullscreen ? "h-screen" : "h-[calc(100vh-6.25rem)] min-h-[580px]"
        )}
      />
    </div>
  );
}
