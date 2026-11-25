import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateOwnProfileSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  const session = await getAuthenticatedProfile();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateOwnProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    // Solo se actualiza full_name; rol y active están bloqueados por RLS y trigger SQL.
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.full_name })
      .eq("id", session.userId);

    if (error) {
      return NextResponse.json(
        { error: "No fue posible actualizar su perfil." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
