import type { Report, ReportEmbedMode } from "@/types/database";
import { isAllowedPowerBiUrl } from "@/lib/security";

/**
 * Contrato extensible para la visualización de informes Power BI.
 *
 * V1 (Actual):
 * - Modo `direct_url`: utiliza la URL configurada por el administrador en Supabase.
 * - Validada contra HTTPS y dominios autorizados de Power BI / Microsoft Fabric.
 *
 * V2 (Futura integración — Power BI Embedded + Microsoft Entra ID):
 * - Generación server-side de Embed Token vía Power BI REST API.
 */
export interface PowerBiEmbedConfig {
  mode: ReportEmbedMode;
  embedUrl: string;
  reportId: string;
  embedToken?: string;
  tokenExpiration?: string;
  isPublicPublishToWebWarning: boolean;
}

export function isLikelyPublishToWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("powerbi.com") &&
      parsed.pathname.toLowerCase().includes("/view")
    );
  } catch {
    return false;
  }
}

export function isSafeIframeUrl(url: string): boolean {
  return isAllowedPowerBiUrl(url);
}

export async function resolvePowerBiEmbedConfig(
  report: Report
): Promise<PowerBiEmbedConfig> {
  if (!isSafeIframeUrl(report.powerbi_url)) {
    throw new Error(
      "La URL del informe no pertenece a un dominio HTTPS autorizado de Power BI."
    );
  }

  return {
    mode: report.embed_mode || "direct_url",
    embedUrl: report.powerbi_url,
    reportId: report.id,
    isPublicPublishToWebWarning: isLikelyPublishToWebUrl(report.powerbi_url),
  };
}
