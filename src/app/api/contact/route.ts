import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validators";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  checkRateLimit,
  getClientIp,
  isSameOriginRequest,
} from "@/lib/security";
import { sendContactNotificationEmail } from "@/services/email.service";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        { error: "Origen de solicitud no autorizado." },
        { status: 403 }
      );
    }

    // Rate limit por IP: máximo 5 envíos cada 10 minutos
    const ip = getClientIp(request);
    const rate = checkRateLimit(`contact:${ip}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error:
            "Ha superado el límite de envíos recientes. Intente nuevamente en unos minutos.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      );
    }

    const body = await request.json();

    // Honeypot anti-bot: si un bot llena el campo oculto "website", responder éxito silencioso sin guardar
    if (typeof body?.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

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

    // Enviar notificación por correo vía Resend (no bloquea el guardado si aún no está configurado)
    await sendContactNotificationEmail({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400 }
    );
  }
}
