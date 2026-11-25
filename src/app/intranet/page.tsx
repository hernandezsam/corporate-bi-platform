import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function IntranetIndexPage() {
  const session = await getAuthenticatedProfile();
  if (session) {
    redirect("/intranet/dashboard");
  }
  redirect("/intranet/login");
}
