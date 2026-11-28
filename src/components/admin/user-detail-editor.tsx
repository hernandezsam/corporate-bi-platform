"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import type { Profile, UserRole } from "@/types/database";
import {
  MODULE_TYPE_LABELS,
  type CorporateModule,
} from "@/types/modules";
import { getIconByName } from "@/lib/icons";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDetailEditorProps {
  user: Profile;
  modules: CorporateModule[];
  initialAssignedModuleIds: string[];
  currentAdminId: string;
}

export function UserDetailEditor({
  user,
  modules,
  initialAssignedModuleIds,
  currentAdminId,
}: UserDetailEditorProps) {
  const router = useRouter();
  const isSelf = user.id === currentAdminId;

  const [form, setForm] = useState({
    full_name: user.full_name,
    role: user.role as UserRole,
    active: user.active,
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assignedIds, setAssignedIds] = useState<string[]>(
    initialAssignedModuleIds
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const groupedModules = useMemo(() => {
    const groups = new Map<string, CorporateModule[]>();
    for (const m of modules) {
      const cat = m.category || "General";
      const list = groups.get(cat) ?? [];
      list.push(m);
      groups.set(cat, list);
    }
    return Array.from(groups.entries());
  }, [modules]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No se pudo actualizar el usuario.",
        });
        return;
      }
      setForm((prev) => ({ ...prev, password: "" }));
      setFeedback({
        type: "success",
        text: "Datos del usuario guardados correctamente.",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleModule(moduleId: string, nextAssigned: boolean) {
    setFeedback(null);
    setTogglingId(moduleId);
    const previous = assignedIds;
    setAssignedIds((prev) =>
      nextAssigned ? [...prev, moduleId] : prev.filter((id) => id !== moduleId)
    );

    try {
      const res = await fetch("/api/admin/module-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          module_id: moduleId,
          assigned: nextAssigned,
        }),
      });
      if (!res.ok) {
        setAssignedIds(previous);
        const data = await res.json();
        setFeedback({
          type: "error",
          text: data.error || "No se pudo actualizar la asignación.",
        });
        return;
      }
      router.refresh();
    } catch {
      setAssignedIds(previous);
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setTogglingId(null);
    }
  }

  async function handleBulkSet(selectAll: boolean) {
    setFeedback(null);
    setBulkLoading(true);
    const targetIds = selectAll ? modules.map((m) => m.id) : [];
    const previous = assignedIds;
    setAssignedIds(targetIds);

    try {
      const res = await fetch("/api/admin/module-assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          module_ids: targetIds,
        }),
      });
      if (!res.ok) {
        setAssignedIds(previous);
        setFeedback({
          type: "error",
          text: "No se pudo aplicar la actualización masiva.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: selectAll
          ? "Todos los módulos fueron asignados a este usuario."
          : "Se revocaron todas las asignaciones de este usuario.",
      });
      router.refresh();
    } catch {
      setAssignedIds(previous);
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `¿Seguro que desea eliminar permanentemente a ${user.full_name}?`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setFeedback({
          type: "error",
          text: data.error || "No se pudo eliminar el usuario.",
        });
        return;
      }
      router.push("/admin/usuarios");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/admin/usuarios" aria-label="Volver a usuarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {user.full_name}
            </h1>
            <p className="text-sm text-slate-500">
              {user.email} · Creado el {formatDateTime(user.created_at)}
            </p>
          </div>
        </div>

        {!isSelf && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Eliminar usuario
          </Button>
        )}
      </div>

      {feedback && (
        <Alert variant={feedback.type === "success" ? "success" : "destructive"}>
          {feedback.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Datos del Usuario */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Datos y Permisos de Cuenta</CardTitle>
            <CardDescription>
              Configure el rol, estado de acceso o restablezca la contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input
                  id="full_name"
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Correo electrónico</Label>
                <Input value={user.email} disabled className="bg-slate-50" />
              </div>

              <div className="space-y-1.5">
                <Label>Rol</Label>
                <Select
                  value={form.role}
                  disabled={isSelf}
                  onValueChange={(val) =>
                    setForm({ ...form, role: val as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pwd">
                  Restablecer contraseña (opcional, mínimo 8 caracteres)
                </Label>
                <Input
                  id="pwd"
                  type="password"
                  minLength={8}
                  placeholder="Dejar en blanco para mantener actual"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-medium text-slate-900">
                    Cuenta activa
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Desactivar revoca inmediatamente el acceso a la intranet.
                  </p>
                </div>
                <Switch
                  checked={form.active}
                  disabled={isSelf}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, active: checked })
                  }
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Asignación de Módulos */}
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Módulos asignados ({assignedIds.length} / {modules.length})
              </CardTitle>
              <CardDescription>
                Los cambios se guardan inmediatamente en Supabase.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={bulkLoading || modules.length === 0}
                onClick={() => handleBulkSet(true)}
              >
                Asignar todos
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={bulkLoading || assignedIds.length === 0}
                onClick={() => handleBulkSet(false)}
              >
                Quitar todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {modules.length === 0 ? (
              <p className="text-sm text-slate-500">
                No existen módulos creados aún. Cree módulos en{" "}
                <Link
                  href="/admin/modulos"
                  className="font-medium text-[#159F91] hover:underline"
                >
                  Gestión de Módulos
                </Link>
                .
              </p>
            ) : (
              groupedModules.map(([category, items]) => (
                <div key={category} className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {category}
                  </p>
                  <div className="space-y-2">
                    {items.map((mod) => {
                      const Icon = getIconByName(mod.icon);
                      const checked = assignedIds.includes(mod.id);
                      const busy = togglingId === mod.id || bulkLoading;

                      return (
                        <label
                          key={mod.id}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2.5 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Checkbox
                              checked={checked}
                              disabled={busy}
                              onCheckedChange={(val) =>
                                handleToggleModule(mod.id, Boolean(val))
                              }
                            />
                            <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {mod.name}
                              </p>
                              {mod.description && (
                                <p className="truncate text-xs text-slate-500">
                                  {mod.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-[10px]">
                              {MODULE_TYPE_LABELS[mod.module_type]}
                            </Badge>
                            {!mod.active && (
                              <Badge variant="secondary" className="text-[10px]">
                                Inactivo
                              </Badge>
                            )}
                            {busy && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#159F91]" />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
