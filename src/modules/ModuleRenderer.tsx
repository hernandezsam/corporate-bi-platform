"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import type { Profile } from "@/types/database";
import type { CorporateModule } from "@/types/modules";
import { ModuleContainer } from "@/modules/shared/ModuleContainer";
import { ModuleError } from "@/modules/shared/ModuleError";
import { PowerBIViewer } from "@/modules/powerbi/PowerBIViewer";
import { HTMLViewer } from "@/modules/html/HTMLViewer";
import { PDFViewer } from "@/modules/documents/PDFViewer";
import { getRegisteredModuleComponent } from "@/modules/registry";
import { isAllowedDocumentUrl } from "@/lib/security";
import { Button } from "@/components/ui/button";

interface ModuleRendererProps {
  module: CorporateModule;
  profile: Pick<Profile, "id" | "full_name" | "email" | "role">;
}

/**
 * Motor Universal de Renderizado de Módulos Corporativos de Findex.
 * Identifica automáticamente el tipo de módulo y despacha al visor seguro correspondiente.
 */
export function ModuleRenderer({ module, profile }: ModuleRendererProps) {
  const [reloadKey, setReloadKey] = useState(0);

  const isIframeModule =
    module.module_type === "POWERBI" ||
    module.module_type === "HTML" ||
    module.module_type === "PDF";

  const canDownloadPdf =
    module.module_type === "PDF" &&
    Boolean(module.config?.allow_download) &&
    Boolean(module.source_url) &&
    isAllowedDocumentUrl(module.source_url || "");

  const extraActions = canDownloadPdf ? (
    <Button asChild variant="outline" size="sm" className="h-7 px-2.5 text-xs">
      <a
        href={module.source_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Descargar PDF</span>
      </a>
    </Button>
  ) : undefined;

  return (
    <ModuleContainer
      module={module}
      edgeToEdge={isIframeModule}
      onReload={isIframeModule ? () => setReloadKey((k) => k + 1) : undefined}
      extraActions={extraActions}
    >
      {({ isFullscreen }) => {
        switch (module.module_type) {
          case "POWERBI":
            return (
              <PowerBIViewer
                module={module}
                reloadKey={reloadKey}
                isFullscreen={isFullscreen}
              />
            );

          case "HTML":
            return (
              <HTMLViewer
                module={module}
                reloadKey={reloadKey}
                isFullscreen={isFullscreen}
              />
            );

          case "PDF":
            return (
              <PDFViewer
                module={module}
                reloadKey={reloadKey}
                isFullscreen={isFullscreen}
              />
            );

          case "APP":
          case "TOOL": {
            const RegisteredComponent = getRegisteredModuleComponent(
              module.config?.app_key
            );
            if (!RegisteredComponent) {
              return (
                <ModuleError
                  title="Aplicación no registrada"
                  description={`No se encontró un componente registrado para el identificador "${module.config?.app_key || "sin configurar"}". Revise la configuración en /admin/modulos.`}
                />
              );
            }
            return (
              <RegisteredComponent
                key={reloadKey}
                module={module}
                profile={profile}
              />
            );
          }

          default:
            return (
              <ModuleError
                title="Tipo de módulo no soportado"
                description="El tipo configurado para este recurso no cuenta con un visor habilitado."
              />
            );
        }
      }}
    </ModuleContainer>
  );
}
