import { z } from "zod";

export const safeHttpsUrlSchema = z
  .string()
  .trim()
  .url("Ingrese una URL válida.")
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "La URL del informe debe utilizar protocolo seguro HTTPS." }
  );

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
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
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
  report_ids: z.array(z.string().uuid()).optional().default([]),
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
  category_id: z.string().uuid("Seleccione una categoría válida.").nullable().optional(),
  category: z.string().trim().max(80).optional(),
  icon: z.string().trim().min(1).max(40).default("BarChart3"),
  active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  embed_mode: z.enum(["direct_url", "powerbi_embedded"]).optional().default("direct_url"),
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
  report_ids: z.array(z.string().uuid()),
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
});
