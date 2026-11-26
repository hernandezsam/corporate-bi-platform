import { NextResponse } from "next/server";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createUserSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const admin = createAdminSupabaseClient();
    const [{ data: profiles, error: pErr }, { data: assignments, error: aErr }] =
      await Promise.all([
        admin.from("profiles").select("*").order("created_at", { ascending: false }),
        admin.from("user_reports").select("user_id, report_id"),
      ]);

    if (pErr || aErr) {
      return NextResponse.json(
        { error: "No fue posible consultar los usuarios." },
        { status: 500 }
      );
    }

    const map = new Map<string, string[]>();
    for (const row of assignments ?? []) {
      const list = map.get(row.user_id) ?? [];
      list.push(row.report_id);
      map.set(row.user_id, list);
    }

    const enriched = (profiles ?? []).map((p) => {
      const ids = map.get(p.id) ?? [];
      return {
        ...p,
        assigned_report_ids: ids,
        assigned_reports_count: ids.length,
      };
    });

    return NextResponse.json({ users: enriched });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdminApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const { full_name, email, password, role, active, report_ids } = parsed.data;
    const admin = createAdminSupabaseClient();

    // 1. Crear usuario en Supabase Auth mediante API administrativa segura
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
        ban_duration: active ? "none" : "876000h",
      });

    if (createError || !created.user) {
      const msg = createError?.message?.toLowerCase().includes("already")
        ? "Ya existe un usuario registrado con ese correo electrónico."
        : createError?.message || "No fue posible crear el usuario en Auth.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const userId = created.user.id;

    // 2. Actualizar/asegurar registro en public.profiles con rol y estado reales
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name,
          email: email.toLowerCase(),
          role,
          active,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (profileError) {
      // Rollback del usuario en Auth si falla la tabla profiles
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "No fue posible registrar el perfil del usuario." },
        { status: 500 }
      );
    }

    // 3. Asignar informes iniciales si se seleccionaron
    if (report_ids.length > 0) {
      const rows = report_ids.map((reportId) => ({
        user_id: userId,
        report_id: reportId,
        assigned_by: auth.session.userId,
      }));
      await admin
        .from("user_reports")
        .upsert(rows, { onConflict: "user_id,report_id" });
    }

    await logAdminAction({
      actorId: auth.session.userId,
      actorEmail: auth.session.profile.email,
      action: "user.create",
      targetType: "user",
      targetId: userId,
      metadata: { email, role, active, reports_count: report_ids.length },
    });

    return NextResponse.json(
      {
        user: {
          ...profile,
          assigned_report_ids: report_ids,
          assigned_reports_count: report_ids.length,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno al crear el usuario.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
