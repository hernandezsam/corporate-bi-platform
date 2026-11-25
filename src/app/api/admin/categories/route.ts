import { NextResponse } from "next/server";
import { verifyAdminApiRequest } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "No fue posible consultar las categorías." },
      { status: 500 }
    );
  }

  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApiRequest();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error) {
      const msg = error.code === "23505"
        ? "Ya existe una categoría con ese nombre."
        : "No fue posible crear la categoría.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
