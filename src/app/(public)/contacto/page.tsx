import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactForm } from "@/components/public/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Póngase en contacto con ${siteConfig.companyName}.`,
};

export default function ContactoPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-slate-200/80 bg-slate-50/70 bg-subtle-grid py-16 lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Contacto Corporativo
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Conversemos sobre su próximo proyecto
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Complete el formulario o utilice nuestros canales directos. Un especialista
            de nuestro equipo revisará su consulta.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Oficina central y canales corporativos (datos editables en configuración).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Dirección</p>
                    <p className="text-slate-600">{siteConfig.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Teléfono</p>
                    <p className="text-slate-600">{siteConfig.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Correo electrónico</p>
                    <p className="text-slate-600">{siteConfig.contact.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Horario de atención</p>
                    <p className="text-slate-600">{siteConfig.contact.hours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Envíenos un mensaje</CardTitle>
                <CardDescription>
                  Los campos marcados con * son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
