import { z } from "zod";
import {
  isAllowedDocumentUrl,
  isAllowedHtmlAppUrl,
  isAllowedPowerBiUrl,
} from "@/lib/security";
import { REGISTERED_APP_KEYS } from "@/modules/registry-meta";

export const safeHttpsUrlSchema = z
  .string()
  .trim()
  .max(2048, "La URL excede el largo máximo permitido.")
  .url("Ingrese una URL válida.")
  .refine((val) => isAllowedPowerBiUrl(val), {
    message:
      "Solo se permiten enlaces seguros HTTPS de Power BI (*.powerbi.com / *.fabric.microsoft.com).",
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Ingrese un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().trim().email("Ingrese un correo electrónico válido."),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
      .max(72, "La contraseña es demasiado larga."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const updateOwnProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre es demasiado largo."),
});

export const createUserSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "El nombre completo debe tener al menos 2 caracteres.")
    .max(120, "El nombre completo es demasiado largo."),
  email: z.string().trim().toLowerCase().email("Ingrese un correo válido."),
  password: z
    .string()
    .min(8, "La contraseña inicial debe tener al menos 8 caracteres.")
    .max(72, "La contraseña es demasiado larga."),
  role: z.enum(["ADMIN", "USER"]),
  active: z.boolean().default(true),
  report_ids: z
    .array(z.string().uuid())
    .max(200, "Máximo 200 módulos por operación.")
    .optional()
    .default([]),
  module_ids: z
    .array(z.string().uuid())
    .max(200, "Máximo 200 módulos por operación.")
    .optional(),
});

export const updateUserSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "El nombre completo debe tener al menos 2 caracteres.")
    .max(120)
    .optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  active: z.boolean().optional(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72)
    .optional()
    .or(z.literal("")),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre es demasiado largo."),
  description: z.string().trim().max(300).optional().default(""),
  icon: z.string().trim().min(1).max(40).default("Folder"),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
});

export const reportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre del informe es obligatorio.")
    .max(140, "El nombre es demasiado largo."),
  description: z.string().trim().max(500).optional().default(""),
  powerbi_url: safeHttpsUrlSchema,
  category_id: z
    .string()
    .uuid("Seleccione una categoría válida.")
    .nullable()
    .optional(),
  category: z.string().trim().max(80).optional(),
  icon: z.string().trim().min(1).max(40).default("BarChart3"),
  active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  embed_mode: z
    .enum(["direct_url", "powerbi_embedded"])
    .optional()
    .default("direct_url"),
  powerbi_workspace_id: z.string().trim().max(120).nullable().optional(),
  powerbi_report_id: z.string().trim().max(120).nullable().optional(),
});

export const assignmentToggleSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
  report_id: z.string().uuid("Informe inválido."),
  assigned: z.boolean(),
});

export const bulkUserAssignmentsSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
  report_ids: z
    .array(z.string().uuid())
    .max(200, "Máximo 200 informes por operación."),
});

// ==============================================================================
// ESQUEMAS DEL MOTOR UNIVERSAL DE MÓDULOS
// ==============================================================================

export const moduleTypeSchema = z.enum([
  "POWERBI",
  "APP",
  "HTML",
  "PDF",
  "TOOL",
]);

export const moduleRenderModeSchema = z.enum([
  "POWERBI_IFRAME",
  "INTERNAL_COMPONENT",
  "EXTERNAL_IFRAME",
  "PDF_VIEWER",
]);

export const moduleSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "El slug debe tener al menos 2 caracteres.")
  .max(80, "El slug es demasiado largo.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "El slug solo puede contener letras minúsculas, números y guiones."
  );

export const moduleConfigSchema = z
  .object({
    embed_mode: z.enum(["direct_url", "powerbi_embedded"]).optional(),
    powerbi_workspace_id: z.string().trim().max(120).nullable().optional(),
    powerbi_report_id: z.string().trim().max(120).nullable().optional(),
    app_key: z.string().trim().max(80).nullable().optional(),
    default_params: z.record(z.string().max(120)).optional(),
    sandbox: z
      .array(
        z.enum([
          "allow-scripts",
          "allow-forms",
          "allow-popups",
          "allow-downloads",
          "allow-modals",
        ])
      )
      .max(6)
      .optional(),
    allow: z.array(z.enum(["fullscreen", "clipboard-write"])).max(4).optional(),
    allow_download: z.boolean().optional(),
    open_toolbar: z.boolean().optional(),
  })
  .default({});

const baseModuleObjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre del módulo es obligatorio.")
    .max(140, "El nombre es demasiado largo."),
  slug: moduleSlugSchema.optional(),
  description: z.string().trim().max(500).optional().default(""),
  category_id: z
    .string()
    .uuid("Seleccione una categoría válida.")
    .nullable()
    .optional(),
  category: z.string().trim().max(80).optional(),
  module_type: moduleTypeSchema,
  render_mode: moduleRenderModeSchema.optional(),
  source_url: z.string().trim().max(2048).nullable().optional(),
  icon: z.string().trim().min(1).max(40).default("LayoutGrid"),
  thumbnail_url: z
    .string()
    .trim()
    .url("La URL de imagen debe ser válida.")
    .refine((v) => v.startsWith("https://"), "La imagen debe usar HTTPS.")
    .nullable()
    .optional()
    .or(z.literal("")),
  config: moduleConfigSchema.optional().default({}),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
  user_ids: z
    .array(z.string().uuid())
    .max(500, "Máximo 500 usuarios por operación.")
    .optional(),
});

export const createModuleSchema = baseModuleObjectSchema.superRefine(
  (data, ctx) => {
    if (data.module_type === "POWERBI") {
      if (!data.source_url || !isAllowedPowerBiUrl(data.source_url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source_url"],
          message:
            "Para módulos Power BI ingrese una URL HTTPS autorizada (*.powerbi.com / *.fabric.microsoft.com).",
        });
      }
    } else if (data.module_type === "HTML") {
      if (!data.source_url || !isAllowedHtmlAppUrl(data.source_url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source_url"],
          message:
            "Para módulos HTML ingrese una URL HTTPS cuyo dominio esté autorizado en ALLOWED_HTML_APP_HOSTS.",
        });
      }
    } else if (data.module_type === "PDF") {
      if (!data.source_url || !isAllowedDocumentUrl(data.source_url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source_url"],
          message:
            "Para documentos PDF ingrese una URL HTTPS autorizada (Supabase Storage o ALLOWED_DOCUMENT_HOSTS).",
        });
      }
    } else if (data.module_type === "APP" || data.module_type === "TOOL") {
      const appKey = data.config?.app_key;
      if (!appKey || !REGISTERED_APP_KEYS.has(appKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["config", "app_key"],
          message:
            "Seleccione una aplicación o herramienta registrada en el catálogo interno.",
        });
      }
    }
  }
);

export const updateModuleSchema = baseModuleObjectSchema.partial();

export const moduleAssignmentToggleSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
  module_id: z.string().uuid("Módulo inválido."),
  assigned: z.boolean(),
});

export const bulkUserModuleAssignmentsSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
  module_ids: z
    .array(z.string().uuid())
    .max(200, "Máximo 200 módulos por operación."),
});

export const moduleFavoriteSchema = z.object({
  module_id: z.string().uuid("Módulo inválido."),
  is_favorite: z.boolean(),
});

export const contactFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Ingrese su nombre completo.")
    .max(120),
  email: z.string().trim().email("Ingrese un correo electrónico válido."),
  company: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().min(3, "Ingrese un asunto.").max(140),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(2000),
  website: z.string().max(0).optional().default(""),
});
