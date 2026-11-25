import { NextResponse } from "next/server";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validators";

export async function GET() {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: reports, error: rErr }, { data: assignments, error: aErr }] =
    await Promise.all([
      supabase
        .from("reports")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("user_reports").select("report_id, user_id"),
    ]);

  if (rErr || aErr) {
    return NextResponse.json(
      { error: "No fue posible obtener los informes." },
      { status: 500 }
    );
  }

  const map = new Map<string, string[]>();
  for (const row of assignments ?? []) {
    const list = map.get(row.report_id) ?? [];
    list.push(row.user_id);
    map.set(row.report_id, list);
  }

  const enriched = (reports ?? []).map((r) => {
    const ids = map.get(r.id) ?? [];
    return {
      ...r,
      assigned_user_ids: ids,
      assigned_users_count: ids.length,
    };
  });

  return NextResponse.json({ reports: enriched });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos de informe inválidos." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const payload = {
      name: parsed.data.name,
      description: parsed.data.description || "",
      powerbi_url: parsed.data.powerbi_url,
      category_id: parsed.data.category_id || null,
      category: parsed.data.category || "General",
      icon: parsed.data.icon,
      active: parsed.data.active,
      sort_order: parsed.data.sort_order,
      embed_mode: parsed.data.embed_mode || "direct_url",
      powerbi_workspace_id: parsed.data.powerbi_workspace_id || null,
      powerbi_report_id: parsed.data.powerbi_report_id || null,
    };

    const { data, error } = await supabase
      .from("reports")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No fue posible crear el informe." },
        { status: 500 }
      );
    }

    return NextResponse.json({ report: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
