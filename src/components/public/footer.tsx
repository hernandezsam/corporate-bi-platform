import Link from "next/link";
import { Lock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/shared/brand-logo";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#0D1B2A] text-slate-300">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <BrandLogo variant="light" showTagline size="md" />
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              {siteConfig.description}
            </p>
            <div className="pt-2">
              <Link
                href="/intranet/login"
                className="inline-flex items-center gap-2 rounded-md border border-[#D99A55]/30 bg-white/5 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:border-[#D99A55]/60 hover:bg-white/10"
              >
                <Lock className="h-3.5 w-3.5 text-[#D99A55]" />
                Acceso Intranet Findex
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-[#0F9D8A]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0F9D8A]" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#0F9D8A]" />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#0F9D8A]" />
                <span>{siteConfig.contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {siteConfig.legalName}. Todos los derechos reservados.
          </p>
          <p>
            Control de gestión con IA sobre su ERP · Datos alojados en Microsoft
            Azure Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
