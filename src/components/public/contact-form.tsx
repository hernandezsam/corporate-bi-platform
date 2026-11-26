"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export function ContactForm() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo enviar su mensaje. Intente nuevamente.");
      } else {
        setSuccess(true);
        setForm({
          full_name: "",
          email: "",
          company: "",
          phone: "",
          subject: "",
          message: "",
          website: "",
        });
      }
    } catch {
      setError("Error de conexión al enviar el formulario.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo honeypot anti-spam oculto para usuarios reales */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
      />
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Gracias por escribirnos. Su solicitud ha sido registrada correctamente y
            nuestro equipo se pondrá en contacto a la brevedad.
          </span>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nombre completo *</Label>
          <Input
            id="full_name"
            required
            placeholder="Ej. María González"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo corporativo *</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="nombre@empresa.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company">Empresa / Organización</Label>
          <Input
            id="company"
            placeholder="Nombre de su empresa"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+56 9 0000 0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Asunto *</Label>
        <Input
          id="subject"
          required
          placeholder="Ej. Solicitud de reunión por control de proyectos"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Mensaje *</Label>
        <Textarea
          id="message"
          required
          rows={5}
          placeholder="Cuéntenos brevemente sobre su requerimiento o proyecto..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar consulta
          </>
        )}
      </Button>
    </form>
  );
}
