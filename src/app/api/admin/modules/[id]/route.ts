import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createModuleSchema, updateModuleSchema } from "@/lib/validators";
import { logAdminAction } from "@/lib/audit";
import { DEFAULT_RENDER_MODE_BY_TYPE } from "@/types/modules";

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
    return NextResponse.json({ error: "ID de módulo inválido." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: mod }, { data: assignments }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", id).maybeSingle(),
    supabase.from("user_modules").select("user_id").eq("module_id", id),
  ]);

  if (!mod) {
    return NextResponse.json({ error: "Módulo no encontrado." }, { status: 404 });
  }

  const assignedUserIds = (assignments ?? []).map((a) => a.user_id);

  return NextResponse.json({
    module: {
      ...mod,
      assigned_user_ids: assignedUserIds,
      assigned_users_count: assignedUserIds.length,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await verifyAdminApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de módulo inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: current, error: fetchErr } = await supabase
      .from("modules")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !current) {
      return NextResponse.json(
        { error: "Módulo no encontrado." },
        { status: 404 }
      );
    }

    const nextType = parsed.data.module_type ?? current.module_type;
    const isInternalApp = nextType === "APP" || nextType === "TOOL";
    const mergedForValidation = {
      name: parsed.data.name ?? current.name,
      slug: parsed.data.slug ?? current.slug,
      description: parsed.data.description ?? current.description,
      category_id:
        parsed.data.category_id !== undefined
          ? parsed.data.category_id
          : current.category_id,
      category: parsed.data.category ?? current.category,
      module_type: nextType,
      render_mode:
        parsed.data.render_mode ??
        (parsed.data.module_type
          ? DEFAULT_RENDER_MODE_BY_TYPE[parsed.data.module_type]
          : current.render_mode),
      source_url: isInternalApp
        ? null
        : parsed.data.source_url !== undefined
          ? parsed.data.source_url
          : current.source_url,
      icon: parsed.data.icon ?? current.icon,
      thumbnail_url:
        parsed.data.thumbnail_url !== undefined
          ? parsed.data.thumbnail_url
          : current.thumbnail_url,
      config:
        parsed.data.config !== undefined ? parsed.data.config : current.config,
      sort_order: parsed.data.sort_order ?? current.sort_order,
      active: parsed.data.active ?? current.active,
    };

    const fullCheck = createModuleSchema.safeParse(mergedForValidation);
    if (!fullCheck.success) {
      return NextResponse.json(
        {
          error:
            fullCheck.error.issues[0]?.message ||
            "La configuración resultante del módulo no es válida.",
        },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {};
    const fields = [
      "name",
      "slug",
      "description",
      "category_id",
      "category",
      "module_type",
      "render_mode",
      "source_url",
      "icon",
      "thumbnail_url",
      "config",
      "sort_order",
      "active",
    ] as const;

    for (const key of fields) {
      if (parsed.data[key] !== undefined) {
        updatePayload[key] =
          key === "thumbnail_url" && parsed.data[key] === ""
            ? null
            : parsed.data[key];
      }
    }

    if (parsed.data.module_type && !parsed.data.render_mode) {
      updatePayload.render_mode =
        DEFAULT_RENDER_MODE_BY_TYPE[parsed.data.module_type];
    }
    if (isInternalApp) {
      updatePayload.source_url = null;
    }

    const { data, error } = await supabase
      .from("modules")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      const msg =
        error.code === "23505"
          ? "Ya existe otro módulo con ese slug."
          : "No fue posible actualizar el módulo.";
      return NextResponse.json(
        { error: msg },
        { status: error.code === "23505" ? 409 : 500 }
      );
    }

    await logAdminAction({
      actorId: auth.session.userId,
      actorEmail: auth.session.profile.email,
      action: "module.update",
      targetType: "module",
      targetId: id,
      metadata: { updated_fields: Object.keys(updatePayload) },
    });

    return NextResponse.json({ module: data });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await verifyAdminApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de módulo inválido." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("modules").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "No fue posible eliminar el módulo." },
      { status: 500 }
    );
  }

  await logAdminAction({
    actorId: auth.session.userId,
    actorEmail: auth.session.profile.email,
    action: "module.delete",
    targetType: "module",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
