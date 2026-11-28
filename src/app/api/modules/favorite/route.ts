import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/security";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { moduleFavoriteSchema } from "@/lib/validators";

/**
 * Permite a un usuario activo autenticado marcar o desmarcar como favorito
 * un módulo que ya tiene asignado en public.user_modules (RLS + trigger anti-tamper).
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Origen de solicitud no autorizado." },
      { status: 403 }
    );
  }

  const session = await getAuthenticatedProfile();
  if (!session) {
    return NextResponse.json(
      { error: "Sesión no válida o usuario inactivo." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = moduleFavoriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const { module_id, is_favorite } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("user_modules")
      .update({ is_favorite })
      .eq("user_id", session.userId)
      .eq("module_id", module_id)
      .select("id, module_id, is_favorite")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "No fue posible actualizar el favorito." },
        { status: 500 }
      );
    }

    if (!data) {
      // Si es ADMIN probando un módulo sin fila explícita en user_modules,
      // creamos la asignación con is_favorite para guardar su preferencia.
      if (session.profile.role === "ADMIN") {
        const { error: upsertErr } = await supabase
          .from("user_modules")
          .upsert(
            {
              user_id: session.userId,
              module_id,
              assigned_by: session.userId,
              is_favorite,
            },
            { onConflict: "user_id,module_id" }
          );
        if (upsertErr) {
          return NextResponse.json(
            { error: "No fue posible guardar el favorito." },
            { status: 500 }
          );
        }
        return NextResponse.json({ ok: true, module_id, is_favorite });
      }

      return NextResponse.json(
        { error: "El módulo no está asignado a su cuenta." },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, module_id, is_favorite });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
