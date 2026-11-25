import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { updateUserSchema } from "@/lib/validators";

const uuidSchema = z.string().uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de usuario inválido." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const [{ data: profile }, { data: assignments }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.from("user_reports").select("report_id").eq("user_id", id),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      ...profile,
      assigned_report_ids: (assignments ?? []).map((a) => a.report_id),
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de usuario inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const { full_name, role, active, password } = parsed.data;

    // Protección: un administrador no puede desactivarse ni quitarse su propio rol ADMIN
    if (id === auth.session.userId) {
      if (active === false) {
        return NextResponse.json(
          { error: "No puede desactivar su propia cuenta de administrador." },
          { status: 400 }
        );
      }
      if (role && role !== "ADMIN") {
        return NextResponse.json(
          { error: "No puede revocar su propio rol de administrador." },
          { status: 400 }
        );
      }
    }

    const admin = createAdminSupabaseClient();
    const profileUpdates: Record<string, unknown> = {};
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (role !== undefined) profileUpdates.role = role;
    if (active !== undefined) profileUpdates.active = active;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: updateErr } = await admin
        .from("profiles")
        .update(profileUpdates)
        .eq("id", id);

      if (updateErr) {
        return NextResponse.json(
          { error: "No fue posible actualizar el perfil." },
          { status: 500 }
        );
      }
    }

    // Sincronizar cambios con Supabase Auth (estado ban, metadata o contraseña)
    const authUpdates: Record<string, unknown> = {};
    if (full_name !== undefined) {
      authUpdates.user_metadata = { full_name };
    }
    if (active !== undefined) {
      authUpdates.ban_duration = active ? "none" : "876000h";
    }
    if (password && password.length >= 8) {
      authUpdates.password = password;
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authErr } = await admin.auth.admin.updateUserById(
        id,
        authUpdates
      );
      if (authErr) {
        return NextResponse.json(
          { error: "Error al sincronizar cambios con Supabase Auth." },
          { status: 500 }
        );
      }
    }

    const { data: updated } = await admin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    return NextResponse.json({ user: updated });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de usuario inválido." }, { status: 400 });
  }

  if (id === auth.session.userId) {
    return NextResponse.json(
      { error: "No puede eliminar su propia cuenta de administrador." },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminSupabaseClient();
    // Eliminar en Supabase Auth dispara ON DELETE CASCADE en profiles y user_reports
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json(
        { error: "No fue posible eliminar el usuario." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno al eliminar usuario.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
