import type { Metadata } from "next";
import { Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ContactForm } from "@/components/public/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Solicite una demostración sin costo del módulo de estados financieros con los datos de su empresa.",
};

export default function ContactoPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#0D1B2A] bg-dark-grid py-16 text-white lg:py-20">
        <div className="container max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#159F91]">
            {siteConfig.nextStep.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Veamos <span className="text-[#D99A55]">sus números</span>
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            {siteConfig.nextStep.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <Card className="border-[#0D1B2A]/10 bg-[#0D1B2A] text-white">
              <CardHeader>
                <CardTitle className="text-white">
                  ¿Qué incluye la demo sin costo?
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Revise el valor real de Findex antes de tomar una decisión.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200">
                <div className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F9D8A]" />
                  <span>
                    Recorrido por los 5 módulos e informe mensual generado con
                    IA.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F9D8A]" />
                  <span>
                    Plan de implementación en 5 semanas adaptado a su ERP.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canales directos</CardTitle>
                <CardDescription>
                  {siteConfig.contact.contactRole}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#0F9D8A]" />
                  <div>
                    <p className="font-medium text-[#0D1B2A]">Correo</p>
                    <p className="text-slate-600">{siteConfig.contact.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#0F9D8A]" />
                  <div>
                    <p className="font-medium text-[#0D1B2A]">Teléfono</p>
                    <p className="text-slate-600">{siteConfig.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0F9D8A]" />
                  <div>
                    <p className="font-medium text-[#0D1B2A]">Ubicación</p>
                    <p className="text-slate-600">{siteConfig.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#0F9D8A]" />
                  <div>
                    <p className="font-medium text-[#0D1B2A]">Atención</p>
                    <p className="text-slate-600">{siteConfig.contact.hours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar demostración o consulta</CardTitle>
                <CardDescription>
                  Cuéntenos sobre su empresa y coordinemos una revisión con sus
                  cifras.
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
