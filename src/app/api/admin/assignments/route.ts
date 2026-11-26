import { NextResponse } from "next/server";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  assignmentToggleSchema,
  bulkUserAssignmentsSchema,
} from "@/lib/validators";
import { logAdminAction } from "@/lib/audit";

export async function GET(request: Request) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const reportId = searchParams.get("report_id");

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("user_reports").select("*");
  if (userId) query = query.eq("user_id", userId);
  if (reportId) query = query.eq("report_id", reportId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "No fue posible consultar las asignaciones." },
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
    const parsed = assignmentToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const { user_id, report_id, assigned } = parsed.data;
    const supabase = await createServerSupabaseClient();

    if (assigned) {
      const { error } = await supabase.from("user_reports").upsert(
        {
          user_id,
          report_id,
          assigned_by: auth.session.userId,
        },
        { onConflict: "user_id,report_id" }
      );
      if (error) {
        return NextResponse.json(
          { error: "No fue posible asignar el informe." },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from("user_reports")
        .delete()
        .eq("user_id", user_id)
        .eq("report_id", report_id);
      if (error) {
        return NextResponse.json(
          { error: "No fue posible revocar el acceso al informe." },
          { status: 500 }
        );
      }
    }

    await logAdminAction({
      actorId: auth.session.userId,
      actorEmail: auth.session.profile.email,
      action: assigned ? "assignment.grant" : "assignment.revoke",
      targetType: "assignment",
      targetId: `${user_id}:${report_id}`,
      metadata: { user_id, report_id, assigned },
    });

    return NextResponse.json({ ok: true, user_id, report_id, assigned });
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
    const parsed = bulkUserAssignmentsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const { user_id, report_ids } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { error: deleteErr } = await supabase
      .from("user_reports")
      .delete()
      .eq("user_id", user_id);

    if (deleteErr) {
      return NextResponse.json(
        { error: "No fue posible actualizar las asignaciones." },
        { status: 500 }
      );
    }

    if (report_ids.length > 0) {
      const rows = report_ids.map((report_id) => ({
        user_id,
        report_id,
        assigned_by: auth.session.userId,
      }));
      const { error: insertErr } = await supabase
        .from("user_reports")
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
      action: "assignment.bulk_replace",
      targetType: "assignment",
      targetId: user_id,
      metadata: { user_id, reports_count: report_ids.length },
    });

    return NextResponse.json({ ok: true, user_id, report_ids });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
