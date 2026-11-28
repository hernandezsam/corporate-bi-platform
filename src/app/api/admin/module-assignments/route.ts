import { NextResponse } from "next/server";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  moduleAssignmentToggleSchema,
  bulkUserModuleAssignmentsSchema,
} from "@/lib/validators";
import { logAdminAction } from "@/lib/audit";

export async function GET(request: Request) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const moduleId = searchParams.get("module_id");

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("user_modules").select("*");
  if (userId) query = query.eq("user_id", userId);
  if (moduleId) query = query.eq("module_id", moduleId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "No fue posible consultar las asignaciones de módulos." },
      { status: 500 }
    );
  }

  return NextResponse.json({ assignments: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = moduleAssignmentToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const { user_id, module_id, assigned } = parsed.data;
    const supabase = await createServerSupabaseClient();

    if (assigned) {
      const { error } = await supabase.from("user_modules").upsert(
        {
          user_id,
          module_id,
          assigned_by: auth.session.userId,
        },
        { onConflict: "user_id,module_id" }
      );
      if (error) {
        return NextResponse.json(
          { error: "No fue posible asignar el módulo." },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from("user_modules")
        .delete()
        .eq("user_id", user_id)
        .eq("module_id", module_id);
      if (error) {
        return NextResponse.json(
          { error: "No fue posible revocar el acceso al módulo." },
          { status: 500 }
        );
      }
    }

    await logAdminAction({
      actorId: auth.session.userId,
      actorEmail: auth.session.profile.email,
      action: assigned ? "module_assignment.grant" : "module_assignment.revoke",
      targetType: "assignment",
      targetId: `${user_id}:${module_id}`,
      metadata: { user_id, module_id, assigned },
    });

    return NextResponse.json({ ok: true, user_id, module_id, assigned });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const auth = await verifyAdminApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = bulkUserModuleAssignmentsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const { user_id, module_ids } = parsed.data;
    const supabase = await createServerSupabaseClient();

    // Preservar estado is_favorite de los módulos que permanecen asignados
    const { data: existingRows } = await supabase
      .from("user_modules")
      .select("module_id, is_favorite")
      .eq("user_id", user_id);

    const favMap = new Map<string, boolean>();
    for (const r of existingRows ?? []) {
      favMap.set(r.module_id, Boolean(r.is_favorite));
    }

    const { error: deleteErr } = await supabase
      .from("user_modules")
      .delete()
      .eq("user_id", user_id);

    if (deleteErr) {
      return NextResponse.json(
        { error: "No fue posible actualizar las asignaciones." },
        { status: 500 }
      );
    }

    if (module_ids.length > 0) {
      const rows = module_ids.map((module_id) => ({
        user_id,
        module_id,
        assigned_by: auth.session.userId,
        is_favorite: favMap.get(module_id) ?? false,
      }));
      const { error: insertErr } = await supabase
        .from("user_modules")
        .insert(rows);
      if (insertErr) {
        return NextResponse.json(
          { error: "No fue posible guardar las nuevas asignaciones." },
          { status: 500 }
        );
      }
    }

    await logAdminAction({
      actorId: auth.session.userId,
      actorEmail: auth.session.profile.email,
      action: "module_assignment.bulk_replace",
      targetType: "assignment",
      targetId: user_id,
      metadata: { user_id, modules_count: module_ids.length },
    });

    return NextResponse.json({ ok: true, user_id, module_ids });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
