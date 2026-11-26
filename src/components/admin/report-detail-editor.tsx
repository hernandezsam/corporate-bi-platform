"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import type { Category, Profile, Report } from "@/types/database";
import { AVAILABLE_ICONS, getIconByName } from "@/lib/icons";
import { formatDateTime } from "@/lib/utils";
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

interface ReportDetailEditorProps {
  report: Report;
  categories: Category[];
  users: Profile[];
  initialAssignedUserIds: string[];
}

export function ReportDetailEditor({
  report,
  categories,
  users,
  initialAssignedUserIds,
}: ReportDetailEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: report.name,
    description: report.description || "",
    powerbi_url: report.powerbi_url,
    category_id: report.category_id ?? "",
    icon: report.icon || "BarChart3",
    sort_order: report.sort_order ?? 0,
    active: report.active,
    powerbi_workspace_id: report.powerbi_workspace_id ?? "",
    powerbi_report_id: report.powerbi_report_id ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    initialAssignedUserIds
  );
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === form.category_id);
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category_id: form.category_id || null,
          category: selectedCat?.name || "General",
          sort_order: Number(form.sort_order) || 0,
          powerbi_workspace_id: form.powerbi_workspace_id || null,
          powerbi_report_id: form.powerbi_report_id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No se pudo actualizar el informe.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: "Informe actualizado correctamente.",
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
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          report_id: report.id,
          assigned: nextAssigned,
        }),
      });
      if (!res.ok) {
        setAssignedUserIds(previous);
        setFeedback({
          type: "error",
          text: "No se pudo modificar el permiso del usuario.",
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
    if (!window.confirm(`¿Eliminar permanentemente "${report.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setFeedback({ type: "error", text: "No se pudo eliminar el informe." });
        return;
      }
      router.push("/admin/informes");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  const PreviewIcon = getIconByName(form.icon);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/admin/informes" aria-label="Volver a informes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {report.name}
            </h1>
            <p className="text-sm text-slate-500">
              Última actualización: {formatDateTime(report.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((p) => !p)}
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Ocultar vista previa" : "Vista previa iframe"}
          </Button>
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

      {showPreview && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-3">
            <CardTitle className="text-sm">
              Vista previa en vivo del enlace configurado
            </CardTitle>
          </CardHeader>
          <div className="h-[520px] w-full bg-slate-100">
            <iframe
              title={form.name}
              src={form.powerbi_url}
              className="h-full w-full border-0"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle>Configuración del informe</CardTitle>
            <CardDescription>
              Edite título, descripción, enlace Power BI, categoría y orden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="powerbi_url">URL Power BI (HTTPS) *</Label>
                <Input
                  id="powerbi_url"
                  type="url"
                  required
                  value={form.powerbi_url}
                  onChange={(e) =>
                    setForm({ ...form, powerbi_url: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={form.category_id || "NONE"}
                    onValueChange={(val) =>
                      setForm({
                        ...form,
                        category_id: val === "NONE" ? "" : val,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">General</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Icono</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                      <PreviewIcon className="h-4 w-4 text-slate-700" />
                    </div>
                    <Select
                      value={form.icon}
                      onValueChange={(val) => setForm({ ...form, icon: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((ic) => (
                          <SelectItem key={ic} value={ic}>
                            {ic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sort_order">Orden</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({ ...form, sort_order: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <span className="text-xs font-medium text-slate-900">
                  Informe activo en la intranet
                </span>
                <Switch
                  checked={form.active}
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

        {/* Usuarios con acceso a este informe */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle>
              Usuarios con acceso ({assignedUserIds.length} / {users.length})
            </CardTitle>
            <CardDescription>
              Marque o desmarque usuarios para conceder o revocar acceso
              inmediatamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Filtrar usuarios..."
                className="pl-9"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
              {filteredUsers.map((user) => {
                const checked = assignedUserIds.includes(user.id);
                const busy = togglingUserId === user.id;
                return (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200/80 px-3.5 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={checked}
                        disabled={busy}
                        onCheckedChange={(val) =>
                          handleToggleUser(user.id, Boolean(val))
                        }
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {user.full_name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={user.role === "ADMIN" ? "info" : "secondary"}
                        className="text-[10px]"
                      >
                        {user.role}
                      </Badge>
                      {!user.active && (
                        <Badge variant="destructive" className="text-[10px]">
                          Inactivo
                        </Badge>
                      )}
                      {busy && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
