import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <BrandLogo className="mb-8" />
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        El recurso que intenta consultar no existe o fue movido.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Sitio corporativo
          </Link>
        </Button>
        <Button asChild>
          <Link href="/intranet/dashboard">Ir a la Intranet</Link>
        </Button>
      </div>
    </div>
  );
}
