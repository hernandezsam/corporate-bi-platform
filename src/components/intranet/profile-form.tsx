"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, Save, AlertCircle } from "lucide-react";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema } from "@/lib/validators";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/utils";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.error || "No se pudo actualizar." });
      } else {
        setProfileMsg({ type: "success", text: "Perfil actualizado correctamente." });
        router.refresh();
      }
    } catch {
      setProfileMsg({ type: "error", text: "Error de conexión." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    const parsed = updatePasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setPasswordMsg({
        type: "error",
        text: parsed.error.issues[0]?.message || "Verifique las contraseñas.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });
      if (error) {
        setPasswordMsg({
          type: "error",
          text: "No fue posible cambiar la contraseña. Intente nuevamente.",
        });
      } else {
        setPasswordMsg({
          type: "success",
          text: "Contraseña actualizada con éxito.",
        });
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Error de conexión." });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Puede actualizar su nombre visible. El rol y correo son gestionados
            por un administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileMsg && (
            <Alert
              variant={profileMsg.type === "success" ? "success" : "destructive"}
              className="mb-4"
            >
              {profileMsg.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </Alert>
          )}

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Correo electrónico</Label>
              <Input value={profile.email} disabled className="bg-slate-50" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-xs font-medium text-slate-500">Rol asignado</p>
                <div className="mt-1">
                  <Badge variant={profile.role === "ADMIN" ? "info" : "secondary"}>
                    {profile.role}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Estado de cuenta</p>
                <div className="mt-1">
                  <Badge variant={profile.active ? "success" : "destructive"}>
                    {profile.active ? "Activa" : "Desactivada"}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Cuenta creada el {formatDateTime(profile.created_at)}
            </p>

            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad de Acceso</CardTitle>
          <CardDescription>
            Actualice su contraseña periódicamente para proteger su cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordMsg && (
            <Alert
              variant={passwordMsg.type === "success" ? "success" : "destructive"}
              className="mb-4"
            >
              {passwordMsg.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Nueva contraseña</Label>
              <Input
                id="pwd"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pwd-confirm">Confirmar nueva contraseña</Label>
              <Input
                id="pwd-confirm"
                type="password"
                required
                minLength={8}
                placeholder="Repita la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" variant="outline" disabled={savingPassword}>
              {savingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Cambiar contraseña
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
