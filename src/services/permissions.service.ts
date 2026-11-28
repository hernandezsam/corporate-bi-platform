import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type { CorporateModule } from "@/types/modules";

/**
 * Validación explícita en servidor de permisos de acceso a un módulo
 * (defensa en profundidad adicional a PostgreSQL RLS).
 */
export async function canUserAccessModule(
  profile: Profile,
  corporateModule: CorporateModule
): Promise<boolean> {
  if (!profile.active) return false;
  if (profile.role === "ADMIN") return true;
  if (!corporateModule.active) return false;

  const supabase = await createServerSupabaseClient();
  const { data: assignment } = await supabase
    .from("user_modules")
    .select("id")
    .eq("user_id", profile.id)
    .eq("module_id", corporateModule.id)
    .maybeSingle();

  return Boolean(assignment);
}
