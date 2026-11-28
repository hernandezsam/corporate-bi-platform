"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import type { Category, Profile } from "@/types/database";
import {
  DEFAULT_RENDER_MODE_BY_TYPE,
  MODULE_TYPE_LABELS,
  type CorporateModule,
  type ModuleConfig,
  type ModuleType,
} from "@/types/modules";
import { REGISTERED_APPS_META } from "@/modules/registry-meta";
import { ModuleRenderer } from "@/modules/ModuleRenderer";
import { AVAILABLE_ICONS } from "@/lib/icons";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface ModuleDetailEditorProps {
  module: CorporateModule;
  categories: Category[];
  users: Profile[];
  initialAssignedUserIds: string[];
  adminProfile: Profile;
}

const SANDBOX_OPTIONS = [
  { id: "allow-scripts", label: "Ejecutar scripts (allow-scripts)" },
  { id: "allow-forms", label: "Enviar formularios (allow-forms)" },
  { id: "allow-popups", label: "Abrir popups (allow-popups)" },
  { id: "allow-downloads", label: "Descargas (allow-downloads)" },
  { id: "allow-modals", label: "Diálogos (allow-modals)" },
] as const;

export function ModuleDetailEditor({
  module: initialModule,
  categories,
  users,
  initialAssignedUserIds,
  adminProfile,
}: ModuleDetailEditorProps) {
  const router = useRouter();
  const [mod, setMod] = useState<CorporateModule>(initialModule);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    name: initialModule.name,
    slug: initialModule.slug,
    description: initialModule.description || "",
    category_id: initialModule.category_id || "",
    module_type: initialModule.module_type as ModuleType,
    source_url: initialModule.source_url || "",
    icon: initialModule.icon || "LayoutGrid",
    sort_order: initialModule.sort_order ?? 0,
    active: initialModule.active,
    app_key:
      initialModule.config?.app_key || REGISTERED_APPS_META[0]?.key || "",
    embed_mode:
      (initialModule.config?.embed_mode as "direct_url" | "powerbi_embedded") ||
      "direct_url",
    powerbi_workspace_id: initialModule.config?.powerbi_workspace_id || "",
    powerbi_report_id: initialModule.config?.powerbi_report_id || "",
    sandbox: initialModule.config?.sandbox ?? ["allow-scripts", "allow-forms"],
    allow_download: Boolean(initialModule.config?.allow_download),
    open_toolbar:
      initialModule.config?.open_toolbar !== undefined
        ? Boolean(initialModule.config.open_toolbar)
        : true,
  });

  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    initialAssignedUserIds
  );
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function toggleSandbox(token: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      sandbox: checked
        ? Array.from(new Set([...prev.sandbox, token]))
        : prev.sandbox.filter((t) => t !== token),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    const selectedCat = categories.find((c) => c.id === form.category_id);

    let config: ModuleConfig = {};
    if (form.module_type === "POWERBI") {
      config = {
        embed_mode: form.embed_mode,
        powerbi_workspace_id: form.powerbi_workspace_id || null,
        powerbi_report_id: form.powerbi_report_id || null,
      };
    } else if (form.module_type === "APP" || form.module_type === "TOOL") {
      config = { app_key: form.app_key };
    } else if (form.module_type === "HTML") {
      config = { sandbox: form.sandbox, allow: ["fullscreen"] };
    } else if (form.module_type === "PDF") {
      config = {
        allow_download: form.allow_download,
        open_toolbar: form.open_toolbar,
      };
    }

    const isInternal =
      form.module_type === "APP" || form.module_type === "TOOL";

    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          category_id: form.category_id || null,
          category: selectedCat?.name || mod.category || "General",
          module_type: form.module_type,
          render_mode: DEFAULT_RENDER_MODE_BY_TYPE[form.module_type],
          source_url: isInternal ? null : form.source_url.trim(),
          icon: form.icon,
          config,
          sort_order: Number(form.sort_order) || 0,
          active: form.active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No fue posible actualizar el módulo.",
        });
        return;
      }

      setMod(data.module);
      setFeedback({
        type: "success",
        text: "Cambios del módulo guardados correctamente.",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleUser(userId: string, nextAssigned: boolean) {
    setFeedback(null);
    setTogglingUserId(userId);
    const previous = assignedUserIds;
    setAssignedUserIds((prev) =>
      nextAssigned ? [...prev, userId] : prev.filter((id) => id !== userId)
    );

    try {
      const res = await fetch("/api/admin/module-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          module_id: mod.id,
          assigned: nextAssigned,
        }),
      });
      if (!res.ok) {
        setAssignedUserIds(previous);
        const data = await res.json();
        setFeedback({
          type: "error",
          text: data.error || "No se pudo actualizar la asignación.",
        });
        return;
      }
      router.refresh();
    } catch {
      setAssignedUserIds(previous);
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setTogglingUserId(null);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `¿Seguro que desea eliminar permanentemente el módulo "${mod.name}"?`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setFeedback({
          type: "error",
          text: data.error || "No fue posible eliminar el módulo.",
        });
        return;
      }
      router.push("/admin/modulos");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/admin/modulos" aria-label="Volver a módulos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                {mod.name}
              </h1>
              <Badge variant="outline" className="text-xs">
                {MODULE_TYPE_LABELS[mod.module_type]}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Slug: <span className="font-mono">{mod.slug}</span> · Actualizado:{" "}
              {formatDateTime(mod.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ocultar vista previa
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-[#159F91]" />
                Vista previa
              </>
            )}
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href={`/intranet/modulos/${mod.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Abrir en Intranet
            </Link>
          </Button>

          <Button
            type="button"
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
            Eliminar
          </Button>
        </div>
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

      {/* Vista previa integrada */}
      {showPreview && (
        <div className="rounded-xl border-2 border-[#159F91]/30 bg-white p-2 shadow-sm">
          <ModuleRenderer
            module={mod}
            profile={{
              id: adminProfile.id,
              full_name: adminProfile.full_name,
              email: adminProfile.email,
              role: adminProfile.role,
            }}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Formulario principal */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Configuración del Módulo</CardTitle>
            <CardDescription>
              Edite metadatos, origen seguro y parámetros de renderizado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tipo de módulo</Label>
                  <Select
                    value={form.module_type}
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        module_type: val as ModuleType,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POWERBI">Power BI</SelectItem>
                      <SelectItem value="APP">Aplicación nativa</SelectItem>
                      <SelectItem value="TOOL">Herramienta nativa</SelectItem>
                      <SelectItem value="HTML">App HTML externa</SelectItem>
                      <SelectItem value="PDF">Documento PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, category_id: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ed-name">Nombre *</Label>
                  <Input
                    id="ed-name"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ed-slug">Slug URL *</Label>
                  <Input
                    id="ed-slug"
                    required
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase(),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ed-desc">Descripción</Label>
                <Textarea
                  id="ed-desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Condicional por tipo */}
              {(form.module_type === "APP" || form.module_type === "TOOL") && (
                <div className="space-y-1.5 rounded-lg border border-[#159F91]/30 bg-[#EBF7F5]/50 p-3.5">
                  <Label>Componente registrado (app_key) *</Label>
                  <Select
                    value={form.app_key}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, app_key: val }))
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGISTERED_APPS_META.map((app) => (
                        <SelectItem key={app.key} value={app.key}>
                          {app.label} ({app.moduleType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.module_type === "POWERBI" && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="ed-pbi">URL HTTPS Power BI *</Label>
                    <Input
                      id="ed-pbi"
                      type="url"
                      required
                      value={form.source_url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          source_url: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="ed-ws" className="text-xs">
                        Workspace ID (V2)
                      </Label>
                      <Input
                        id="ed-ws"
                        value={form.powerbi_workspace_id}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            powerbi_workspace_id: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ed-rid" className="text-xs">
                        Report ID (V2)
                      </Label>
                      <Input
                        id="ed-rid"
                        value={form.powerbi_report_id}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            powerbi_report_id: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.module_type === "HTML" && (
                <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="ed-html">URL HTTPS autorizada *</Label>
                    <Input
                      id="ed-html"
                      type="url"
                      required
                      value={form.source_url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          source_url: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Sandbox del iframe</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {SANDBOX_OPTIONS.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex cursor-pointer items-center gap-2 text-xs text-slate-700"
                        >
                          <Checkbox
                            checked={form.sandbox.includes(opt.id)}
                            onCheckedChange={(val) =>
                              toggleSandbox(opt.id, Boolean(val))
                            }
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {form.module_type === "PDF" && (
                <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50/40 p-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="ed-pdf">URL HTTPS del PDF *</Label>
                    <Input
                      id="ed-pdf"
                      type="url"
                      required
                      value={form.source_url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          source_url: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                      <span className="text-xs font-medium">
                        Permitir descarga
                      </span>
                      <Switch
                        checked={form.allow_download}
                        onCheckedChange={(v) =>
                          setForm((prev) => ({ ...prev, allow_download: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                      <span className="text-xs font-medium">
                        Barra del visor PDF
                      </span>
                      <Switch
                        checked={form.open_toolbar}
                        onCheckedChange={(v) =>
                          setForm((prev) => ({ ...prev, open_toolbar: v }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Icono</Label>
                  <Select
                    value={form.icon}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, icon: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map((iconName) => (
                        <SelectItem key={iconName} value={iconName}>
                          {iconName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ed-order">Orden</Label>
                  <Input
                    id="ed-order"
                    type="number"
                    min={0}
                    max={9999}
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sort_order: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3">
                    <span className="text-xs font-medium text-slate-800">
                      Activo
                    </span>
                    <Switch
                      checked={form.active}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, active: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar configuración
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Usuarios autorizados */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>
              Usuarios con acceso ({assignedUserIds.length} / {users.length})
            </CardTitle>
            <CardDescription>
              Marque los usuarios autorizados para este módulo. Los cambios se
              aplican de inmediato en PostgreSQL (RLS).
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[540px] space-y-2 overflow-y-auto">
            {users.map((u) => {
              const checked = assignedUserIds.includes(u.id);
              const busy = togglingUserId === u.id;
              return (
                <label
                  key={u.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                    checked
                      ? "border-[#159F91]/40 bg-[#EBF7F5]/60"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Checkbox
                      checked={checked}
                      disabled={busy}
                      onCheckedChange={(val) =>
                        handleToggleUser(u.id, Boolean(val))
                      }
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {u.full_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant={u.role === "ADMIN" ? "info" : "secondary"}
                      className="text-[10px]"
                    >
                      {u.role}
                    </Badge>
                    {busy && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#159F91]" />
                    )}
                  </div>
                </label>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
