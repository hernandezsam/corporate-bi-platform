import { NextResponse } from "next/server";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createModuleSchema } from "@/lib/validators";
import { slugify } from "@/lib/security";
import { logAdminAction } from "@/lib/audit";
import { DEFAULT_RENDER_MODE_BY_TYPE } from "@/types/modules";

export async function GET(request: Request) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type");
  const categoryId = searchParams.get("category_id");

  const supabase = await createServerSupabaseClient();
  let modulesQuery = supabase
    .from("modules")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (typeFilter && typeFilter !== "ALL") {
    modulesQuery = modulesQuery.eq("module_type", typeFilter);
  }
  if (categoryId && categoryId !== "ALL") {
    modulesQuery = modulesQuery.eq("category_id", categoryId);
  }

  const [{ data: modules, error: mErr }, { data: assignments, error: aErr }] =
    await Promise.all([
      modulesQuery,
      supabase.from("user_modules").select("module_id, user_id"),
    ]);

  if (mErr || aErr) {
    return NextResponse.json(
      { error: "No fue posible obtener el catálogo de módulos." },
      { status: 500 }
    );
  }

  const map = new Map<string, string[]>();
  for (const row of assignments ?? []) {
    const list = map.get(row.module_id) ?? [];
    list.push(row.user_id);
    map.set(row.module_id, list);
  }

  const enriched = (modules ?? []).map((m) => {
    const ids = map.get(m.id) ?? [];
    return {
      ...m,
      assigned_user_ids: ids,
      assigned_users_count: ids.length,
    };
  });

  return NextResponse.json({ modules: enriched });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = createModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Datos de módulo inválidos.",
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const baseSlug = parsed.data.slug || slugify(parsed.data.name) || "modulo";

    // Garantizar unicidad del slug si fue autogenerado
    let finalSlug = baseSlug;
    const { data: existingSlug } = await supabase
      .from("modules")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existingSlug) {
      if (parsed.data.slug) {
        return NextResponse.json(
          { error: `El slug "${finalSlug}" ya está en uso por otro módulo.` },
          { status: 409 }
        );
      }
      finalSlug = `${baseSlug.slice(0, 72)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const renderMode =
      parsed.data.render_mode ||
      DEFAULT_RENDER_MODE_BY_TYPE[parsed.data.module_type];

    const isInternalApp =
      parsed.data.module_type === "APP" || parsed.data.module_type === "TOOL";

    const payload = {
      name: parsed.data.name,
      slug: finalSlug,
      description: parsed.data.description || "",
      category_id: parsed.data.category_id || null,
      category: parsed.data.category || "General",
      module_type: parsed.data.module_type,
      render_mode: renderMode,
      source_url: isInternalApp ? null : parsed.data.source_url || null,
      icon: parsed.data.icon,
      thumbnail_url: parsed.data.thumbnail_url || null,
      config: parsed.data.config || {},
      sort_order: parsed.data.sort_order,
      active: parsed.data.active,
    };

    const { data, error } = await supabase
      .from("modules")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      const msg =
        error.code === "23505"
          ? "Ya existe un módulo con ese slug."
          : "No fue posible crear el módulo.";
      return NextResponse.json({ error: msg }, { status: error.code === "23505" ? 409 : 500 });
    }

    const assignedUserIds = parsed.data.user_ids ?? [];
    if (assignedUserIds.length > 0) {
      const rows = assignedUserIds.map((userId) => ({
        user_id: userId,
        module_id: data.id,
        assigned_by: auth.session.userId,
      }));
      await supabase
        .from("user_modules")
        .upsert(rows, { onConflict: "user_id,module_id" });
    }

    await logAdminAction({
      actorId: auth.session.userId,
      actorEmail: auth.session.profile.email,
      action: "module.create",
      targetType: "module",
      targetId: data.id,
      metadata: {
        name: data.name,
        slug: data.slug,
        module_type: data.module_type,
        category: data.category,
        assigned_users_count: assignedUserIds.length,
      },
    });

    return NextResponse.json(
      {
        module: {
          ...data,
          assigned_user_ids: assignedUserIds,
          assigned_users_count: assignedUserIds.length,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
