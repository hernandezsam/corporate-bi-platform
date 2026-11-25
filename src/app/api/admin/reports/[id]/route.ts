import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validators";

const uuidSchema = z.string().uuid();
const partialReportSchema = reportSchema.partial();

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
    return NextResponse.json({ error: "ID de informe inválido." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: report }, { data: assignments }] = await Promise.all([
    supabase.from("reports").select("*").eq("id", id).maybeSingle(),
    supabase.from("user_reports").select("user_id").eq("report_id", id),
  ]);

  if (!report) {
    return NextResponse.json({ error: "Informe no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    report: {
      ...report,
      assigned_user_ids: (assignments ?? []).map((a) => a.user_id),
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
    return NextResponse.json({ error: "ID de informe inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = partialReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("reports")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No fue posible actualizar el informe." },
        { status: 500 }
      );
    }

    return NextResponse.json({ report: data });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de informe inválido." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("reports").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "No fue posible eliminar el informe." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
