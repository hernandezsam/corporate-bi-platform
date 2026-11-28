import { redirect } from "next/navigation";

interface LegacyReportDetailProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirección de compatibilidad desde /admin/informes/[id] hacia /admin/modulos/[id].
 */
export default async function LegacyAdminInformeDetailRedirect({
  params,
}: LegacyReportDetailProps) {
  const { id } = await params;
  redirect(`/admin/modulos/${id}`);
}
