import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type {
  CorporateModule,
  ModuleCatalogItem,
  SidebarModuleItem,
} from "@/types/modules";
import { canUserAccessModule } from "@/services/permissions.service";

/**
 * Metadatos mínimos de módulos autorizados para el sidebar (sin source_url).
 */
export async function getAuthorizedSidebarModules(): Promise<
  SidebarModuleItem[]
> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("modules")
    .select("id, name, slug, icon, category, module_type, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (data as SidebarModuleItem[]) ?? [];
}

/**
 * Catálogo de módulos activos autorizados para el usuario con estado de favoritos.
 * No incluye source_url en el catálogo principal (mínimo privilegio en payload RSC).
 */
export async function getAuthorizedCatalogModules(
  userId: string
): Promise<ModuleCatalogItem[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: modules }, { data: userLinks }] = await Promise.all([
    supabase
      .from("modules")
      .select(
        "id, name, slug, description, category_id, category, module_type, render_mode, icon, thumbnail_url, sort_order, active, updated_at"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("user_modules")
      .select("module_id, is_favorite")
      .eq("user_id", userId),
  ]);

  const favSet = new Set(
    (userLinks ?? [])
      .filter((row) => row.is_favorite)
      .map((row) => row.module_id)
  );

  return ((modules ?? []) as Omit<ModuleCatalogItem, "is_favorite">[]).map(
    (m) => ({
      ...m,
      is_favorite: favSet.has(m.id),
    })
  );
}

/**
 * Obtiene un módulo por slug validando doble capa (RLS + permissions.service).
 */
export async function getAuthorizedModuleBySlug(
  slug: string,
  profile: Profile
): Promise<CorporateModule | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("modules")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const mod = data as CorporateModule;
  const allowed = await canUserAccessModule(profile, mod);
  return allowed ? mod : null;
}

/**
 * Obtiene un módulo por UUID (útil para compatibilidad desde /intranet/reportes/[id]).
 */
export async function getAuthorizedModuleById(
  id: string,
  profile: Profile
): Promise<CorporateModule | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const mod = data as CorporateModule;
  const allowed = await canUserAccessModule(profile, mod);
  return allowed ? mod : null;
}
