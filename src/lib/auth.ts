import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Profile } from "@/types/database";

export interface AuthSessionResult {
  userId: string;
  profile: Profile;
}

/**
 * Obtiene el usuario autenticado y su perfil verificado en base de datos.
 * Retorna null si no hay sesión o si el perfil está inactivo.
 */
export async function getAuthenticatedProfile(): Promise<AuthSessionResult | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.active) {
    return null;
  }

  return {
    userId: user.id,
    profile: profile as Profile,
  };
}

/**
 * Protege Server Components de la intranet. Redirige a login si no está autenticado o está inactivo.
 */
export async function requireActiveUser(): Promise<AuthSessionResult> {
  const session = await getAuthenticatedProfile();
  if (!session) {
    redirect("/intranet/login");
  }
  return session;
}

/**
 * Protege Server Components administrativos. Verifica rol ADMIN en base de datos.
 */
export async function requireAdminUser(): Promise<AuthSessionResult> {
  const session = await requireActiveUser();
  if (session.profile.role !== "ADMIN") {
    redirect("/intranet/dashboard?error=forbidden");
  }
  return session;
}

/**
 * Helper para Route Handlers (/api/admin/*).
 * Valida sesión, estado activo y rol ADMIN desde PostgreSQL sin depender del cliente.
 */
export async function verifyAdminApiRequest(): Promise<
  | { ok: true; session: AuthSessionResult }
  | { ok: false; status: number; message: string }
> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      status: 503,
      message: "Supabase no está configurado en el servidor.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, message: "Sesión no válida o expirada." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, status: 403, message: "Perfil de usuario no encontrado." };
  }

  if (!profile.active) {
    return { ok: false, status: 403, message: "Su cuenta se encuentra desactivada." };
  }

  if (profile.role !== "ADMIN") {
    return {
      ok: false,
      status: 403,
      message: "Acceso denegado: se requiere rol de administrador.",
    };
  }

  return {
    ok: true,
    session: {
      userId: user.id,
      profile: profile as Profile,
    },
  };
}
