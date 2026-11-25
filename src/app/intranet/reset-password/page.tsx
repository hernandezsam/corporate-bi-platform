"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema } from "@/lib/validators";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = updatePasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Verifique las contraseñas.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });

      if (updateError) {
        setError(
          "No fue posible actualizar la contraseña. Asegúrese de haber ingresado desde el enlace enviado a su correo."
        );
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/intranet/dashboard");
        router.refresh();
      }, 1500);
    } catch {
      setError("Error de conexión al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Establecer nueva contraseña</CardTitle>
            <CardDescription>
              Defina una contraseña segura de al menos 8 caracteres para su cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="mb-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Contraseña actualizada. Redirigiendo a la intranet...</span>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Repita la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || success}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Guardar nueva contraseña
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/intranet/login"
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
