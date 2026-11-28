import type { Metadata } from "next";
import { requireActiveUser } from "@/lib/auth";
import { getAuthorizedCatalogModules } from "@/services/modules.service";
import { DashboardWorkspace } from "@/components/intranet/dashboard-workspace";

export const metadata: Metadata = {
  title: "Catálogo de Módulos",
};

interface DashboardPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function IntranetDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { profile } = await requireActiveUser();
  const params = await searchParams;

  const modules = await getAuthorizedCatalogModules(profile.id);

  return (
    <DashboardWorkspace
      profile={profile}
      initialModules={modules}
      forbiddenNotice={params.error === "forbidden"}
    />
  );
}
