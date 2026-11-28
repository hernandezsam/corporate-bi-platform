import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";

export interface AuditLogInput {
  actorId: string;
  actorEmail?: string;
  action: string;
  targetType: "user" | "report" | "module" | "category" | "assignment";
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Registra eventos administrativos en `public.audit_logs` (solo servidor).
 * Es no bloqueante (best-effort): si la tabla aún no se aplicó o se revirtió
 * con el script DOWN, la aplicación continúa operando normalmente sin fallar.
 */
export async function logAdminAction(input: AuditLogInput): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  try {
    const admin = createAdminSupabaseClient();
    await admin.from("audit_logs").insert({
      actor_id: input.actorId,
      actor_email: input.actorEmail ?? null,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    // No interrumpir el flujo operativo si la migración opcional aún no fue aplicada
  }
}
