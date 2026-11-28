"use client";

import { useState } from "react";
import type { CorporateModule } from "@/types/modules";
import {
  isAllowedHtmlAppUrl,
  sanitizeIframeAllow,
  sanitizeSandboxTokens,
} from "@/lib/security";
import { cn } from "@/lib/utils";
import { ModuleLoading } from "@/modules/shared/ModuleLoading";
import { ModuleError } from "@/modules/shared/ModuleError";

interface HTMLViewerProps {
  module: CorporateModule;
  reloadKey: number;
  isFullscreen: boolean;
}

/**
 * Visor seguro para aplicaciones HTML/CSS/JS externas.
 * - Valida URL HTTPS contra allowlist explícita.
 * - Aplica iframe sandbox bajo principio de mínimo privilegio (sin allow-same-origin ni allow-top-navigation).
 * - Nunca utiliza dangerouslySetInnerHTML ni comparte el JWT de Supabase con el iframe externo.
 */
export function HTMLViewer({
  module,
  reloadKey,
  isFullscreen,
}: HTMLViewerProps) {
  const [loading, setLoading] = useState(true);
  const url = module.source_url || "";

  if (!url || !isAllowedHtmlAppUrl(url)) {
    return (
      <ModuleError
        title="Aplicación HTML en dominio no autorizado"
        description="Por política de seguridad, este módulo requiere una URL HTTPS cuyo dominio esté registrado en ALLOWED_HTML_APP_HOSTS / NEXT_PUBLIC_ALLOWED_HTML_HOSTS."
      />
    );
  }

  const sandboxAttr = sanitizeSandboxTokens(module.config?.sandbox);
  const allowAttr = sanitizeIframeAllow(module.config?.allow);

  return (
    <div className="relative h-full w-full bg-white">
      {loading && (
        <div className="absolute inset-0 z-10">
          <ModuleLoading label="Cargando aplicación web..." />
        </div>
      )}
      <iframe
        key={reloadKey}
        title={module.name}
        src={url}
        sandbox={sandboxAttr}
        allow={allowAttr}
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        className={cn(
          "w-full border-0",
          isFullscreen ? "h-screen" : "h-[calc(100vh-6.25rem)] min-h-[580px]"
        )}
      />
    </div>
  );
}
