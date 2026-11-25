import { createClient } from "@supabase/supabase-js";

/**
 * Cliente administrativo de Supabase que utiliza SUPABASE_SERVICE_ROLE_KEY.
 * EXCLUSIVO DE SERVIDOR (Route Handlers y Server Actions).
 * NUNCA importar desde componentes de cliente ni exponer la clave al navegador.
 */
export function createAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Error de seguridad: createAdminSupabaseClient solo puede ejecutarse en el servidor."
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan variables de entorno de servidor: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
