import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validators";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "El backend de Supabase aún no está configurado en las variables de entorno.",
        },
        { status: 503 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("contact_messages").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    if (error) {
      return NextResponse.json(
        { error: "No fue posible registrar el mensaje en este momento." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400 }
    );
  }
}
