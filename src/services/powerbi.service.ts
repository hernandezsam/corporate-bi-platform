import type { Report, ReportEmbedMode } from "@/types/database";

/**
 * Contrato extensible para la visualización de informes Power BI.
 *
 * V1 (Actual):
 * - Modo `direct_url`: utiliza la URL configurada por el administrador en Supabase.
 * - El acceso al iframe está protegido por autenticación + RLS en Supabase.
 *
 * V2 (Futura integración — Power BI Embedded + Microsoft Entra ID):
 * - Implementar un proveedor que obtenga un Access Token desde Microsoft Entra ID
 *   (Client Credentials / Service Principal) y genere un Embed Token efímero vía
 *   Power BI REST API (`GenerateTokenInGroup`) usando `powerbi_workspace_id` y
 *   `powerbi_report_id` (campos ya creados en la tabla `reports`).
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
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function resolvePowerBiEmbedConfig(
  report: Report
): Promise<PowerBiEmbedConfig> {
  if (!isSafeIframeUrl(report.powerbi_url)) {
    throw new Error("La URL del informe no cumple con los requisitos de seguridad HTTPS.");
  }

  // En V2, cuando report.embed_mode === 'powerbi_embedded', se invocará aquí
  // el servicio de generación de Embed Token contra Microsoft Entra ID y Power BI API.
  return {
    mode: report.embed_mode || "direct_url",
    embedUrl: report.powerbi_url,
    reportId: report.id,
    isPublicPublishToWebWarning: isLikelyPublishToWebUrl(report.powerbi_url),
  };
}
