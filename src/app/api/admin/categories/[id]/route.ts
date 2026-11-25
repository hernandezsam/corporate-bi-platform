import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validators";

const uuidSchema = z.string().uuid();
const partialCategorySchema = categorySchema.partial();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de categoría inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = partialCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      const msg =
        error.code === "23505"
          ? "Ya existe otra categoría con ese nombre."
          : "No fue posible actualizar la categoría.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ category: data });
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
    return NextResponse.json({ error: "ID de categoría inválido." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "No fue posible eliminar la categoría." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
