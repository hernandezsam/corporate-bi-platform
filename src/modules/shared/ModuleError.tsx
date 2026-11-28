import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModuleErrorProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export function ModuleError({
  title = "Acceso no autorizado o módulo no disponible",
  description = "No tiene permisos asignados para acceder a este módulo o el recurso se encuentra desactivado.",
  showBackButton = true,
}: ModuleErrorProps) {
  return (
    <div className="flex min-h-[360px] items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-lg border-slate-200">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-[#0D1B2A]">{title}</h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          {showBackButton && (
            <Button asChild>
              <Link href="/intranet/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Volver al catálogo
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
