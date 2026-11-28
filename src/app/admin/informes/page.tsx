import { redirect } from "next/navigation";

/**
 * Redirección de compatibilidad desde el antiguo /admin/informes hacia /admin/modulos.
 */
export default function LegacyAdminInformesRedirect() {
  redirect("/admin/modulos");
}
