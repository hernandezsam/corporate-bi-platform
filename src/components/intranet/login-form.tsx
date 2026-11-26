"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, resetPasswordRequestSchema } from "@/lib/validators";
import { sanitizeInternalPath } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

interface LoginFormProps {
  supabaseConfigured: boolean;
}

const URL_ERROR_MESSAGES: Record<string, string> = {
  account_disabled:
    "Su cuenta ha sido desactivada. Comuníquese con un administrador para restablecer el acceso.",
  config_missing:
    "Las variables de entorno de Supabase aún no están configuradas en el servidor.",
  auth_callback_error:
    "El enlace de autenticación o recuperación ha expirado o no es válido.",
};

export function LoginForm({ supabaseConfigured }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/intranet/dashboard";
  const urlErrorCode = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "recovery">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlErrorCode ? URL_ERROR_MESSAGES[urlErrorCode] || null : null
  );
  const [recoverySent, setRecoverySent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabaseConfigured) {
      setError(URL_ERROR_MESSAGES.config_missing);
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Datos inválidos.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

      if (signInError || !data.user) {
        setError(
          "Credenciales incorrectas o cuenta no habilitada. Verifique su correo y contraseña."
        );
        return;
      }

      // Verificar estado activo en la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("active, role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError(
          "No se encontró un perfil corporativo asociado a esta cuenta. Contacte al administrador."
        );
        return;
      }

      if (!profile.active) {
        await supabase.auth.signOut();
        setError(URL_ERROR_MESSAGES.account_disabled);
        return;
      }

      const safeNext = sanitizeInternalPath(nextPath, "/intranet/dashboard");
      router.push(safeNext);
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRecoverySent(false);

    if (!supabaseConfigured) {
      setError(URL_ERROR_MESSAGES.config_missing);
      return;
    }

    const parsed = resetPasswordRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Ingrese un correo válido.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/intranet/auth/callback?next=/intranet/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        parsed.data.email,
        { redirectTo }
      );

      if (resetError) {
        setError(
          "No se pudo enviar el correo de recuperación. Intente nuevamente en unos minutos."
        );
        return;
      }

      setRecoverySent(true);
    } catch {
      setError("Error de conexión al solicitar recuperación.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "recovery") {
    return (
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-slate-500">
            Ingrese su correo corporativo y le enviaremos un enlace seguro para
            restablecer su contraseña.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </Alert>
        )}

        {recoverySent && (
          <Alert variant="success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Si el correo se encuentra registrado, recibirá un enlace de
              recuperación en su bandeja de entrada.
            </span>
          </Alert>
        )}

        <form onSubmit={handleRecovery} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="recovery-email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                placeholder="usuario@empresa.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando instrucciones...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Enviar enlace de recuperación
              </>
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setRecoverySent(false);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Acceso a la Intranet
        </h1>
        <p className="text-sm text-slate-500">
          Ingrese sus credenciales corporativas para consultar sus informes de
          Power BI asignados.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Correo electrónico</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="usuario@empresa.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Contraseña</Label>
            <button
              type="button"
              onClick={() => {
                setMode("recovery");
                setError(null);
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="pl-9 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando acceso...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>

      <div className="rounded-lg border border-slate-200/80 bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
        El registro público se encuentra deshabilitado. Las cuentas y permisos de
        acceso son administrados exclusivamente por el equipo interno.
      </div>

      <div className="pt-1 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al sitio web corporativo
        </Link>
      </div>
    </div>
  );
}
