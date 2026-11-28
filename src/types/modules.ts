import type { Profile } from "@/types/database";

export type ModuleType = "POWERBI" | "APP" | "HTML" | "PDF" | "TOOL";

export type ModuleRenderMode =
  | "POWERBI_IFRAME"
  | "INTERNAL_COMPONENT"
  | "EXTERNAL_IFRAME"
  | "PDF_VIEWER";

export interface ModuleConfig {
  // POWERBI (preparado para V2 Power BI Embedded + Microsoft Entra ID)
  embed_mode?: "direct_url" | "powerbi_embedded";
  powerbi_workspace_id?: string | null;
  powerbi_report_id?: string | null;

  // APP / TOOL (registro controlado de aplicaciones React nativas)
  app_key?: string | null;
  default_params?: Record<string, string>;

  // HTML (iframe externo con sandbox estricto)
  sandbox?: string[];
  allow?: string[];

  // PDF / DOCUMENT
  allow_download?: boolean;
  open_toolbar?: boolean;
}

export interface CorporateModule {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  category: string;
  module_type: ModuleType;
  render_mode: ModuleRenderMode;
  source_url: string | null;
  icon: string;
  thumbnail_url: string | null;
  config: ModuleConfig;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload mínimo serializado en el sidebar RSC (nunca incluye source_url).
 */
export type SidebarModuleItem = Pick<
  CorporateModule,
  "id" | "name" | "slug" | "icon" | "category" | "module_type" | "sort_order"
>;

/**
 * Elemento mostrado en el catálogo del dashboard de la intranet.
 */
export interface ModuleCatalogItem
  extends Pick<
    CorporateModule,
    | "id"
    | "name"
    | "slug"
    | "description"
    | "category_id"
    | "category"
    | "module_type"
    | "render_mode"
    | "icon"
    | "thumbnail_url"
    | "sort_order"
    | "active"
    | "updated_at"
  > {
  is_favorite: boolean;
}

export interface ModuleWithAssignments extends CorporateModule {
  assigned_user_ids: string[];
  assigned_users_count: number;
}

export interface UserModuleAssignment {
  id: string;
  user_id: string;
  module_id: string;
  assigned_by: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface RegisteredAppMeta {
  key: string;
  label: string;
  description: string;
  moduleType: "APP" | "TOOL";
  defaultIcon: string;
  defaultCategory: string;
  version: string;
}

/**
 * Contrato estándar que recibe toda aplicación o herramienta React nativa
 * registrada en el Motor Universal de Módulos de Findex.
 */
export interface RegisteredModuleProps {
  module: CorporateModule;
  profile: Pick<Profile, "id" | "full_name" | "email" | "role">;
}

export const MODULE_TYPE_LABELS: Record<ModuleType, string> = {
  POWERBI: "Power BI",
  APP: "Aplicación",
  HTML: "App HTML",
  PDF: "Documento PDF",
  TOOL: "Herramienta",
};

export const DEFAULT_RENDER_MODE_BY_TYPE: Record<ModuleType, ModuleRenderMode> =
  {
    POWERBI: "POWERBI_IFRAME",
    APP: "INTERNAL_COMPONENT",
    TOOL: "INTERNAL_COMPONENT",
    HTML: "EXTERNAL_IFRAME",
    PDF: "PDF_VIEWER",
  };
