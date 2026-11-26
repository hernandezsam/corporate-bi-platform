/**
 * Servicio de envío de notificaciones de contacto vía Resend REST API.
 * Exclusivo de servidor (usa RESEND_API_KEY sin dependencias externas).
 */

export interface ContactEmailPayload {
  full_name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  subject: string;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactNotificationEmail(
  payload: ContactEmailPayload
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toRaw = process.env.CONTACT_NOTIFY_EMAIL?.trim();

  if (!apiKey || !toRaw) {
    return { sent: false, reason: "resend_not_configured" };
  }

  const recipients = toRaw
    .split(/[,\s]+/)
    .map((addr) => addr.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { sent: false, reason: "no_recipients" };
  }

  // En plan gratuito sin dominio verificado, Resend permite enviar desde onboarding@resend.dev
  // Al verificar tu dominio (ej. findex.cl), configura RESEND_FROM_EMAIL="Findex <contacto@findex.cl>"
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Findex <onboarding@resend.dev>";

  const safeName = escapeHtml(payload.full_name);
  const safeEmail = escapeHtml(payload.email);
  const safeCompany = escapeHtml(payload.company || "No indicada");
  const safePhone = escapeHtml(payload.phone || "No indicado");
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0D1B2A; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
      <div style="background: #0D1B2A; padding: 20px 24px; color: #FFFFFF;">
        <p style="margin: 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #0F9D8A; font-weight: 600;">
          Findex · Nueva consulta web
        </p>
        <h1 style="margin: 6px 0 0; font-size: 18px; font-weight: 600;">
          ${safeSubject}
        </h1>
      </div>
      <div style="padding: 24px; background: #FFFFFF;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 18px;">
          <tr>
            <td style="padding: 6px 0; color: #64748B; width: 130px;"><strong>Nombre:</strong></td>
            <td style="padding: 6px 0; color: #0D1B2A;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B;"><strong>Correo:</strong></td>
            <td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #0B7A6B;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B;"><strong>Empresa:</strong></td>
            <td style="padding: 6px 0; color: #0D1B2A;">${safeCompany}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B;"><strong>Teléfono:</strong></td>
            <td style="padding: 6px 0; color: #0D1B2A;">${safePhone}</td>
          </tr>
        </table>
        <div style="background: #F4F7F9; border-left: 3px solid #0F9D8A; padding: 14px 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1E293B;">
          ${safeMessage}
        </div>
        <p style="margin: 18px 0 0; font-size: 12px; color: #64748B;">
          Puede responder directamente a este correo para contactar a ${safeName}. El mensaje también quedó respaldado en el Panel de Administración de Findex.
        </p>
      </div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: payload.email,
        subject: `[Findex Web] ${payload.subject}`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Resend API error:", response.status, detail);
      return { sent: false, reason: `resend_http_${response.status}` };
    }

    return { sent: true };
  } catch (err) {
    console.error("Error enviando notificación por Resend:", err);
    return { sent: false, reason: "network_error" };
  }
}
