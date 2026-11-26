"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import type { Category, ReportWithAssignments } from "@/types/database";
import { AVAILABLE_ICONS, getIconByName } from "@/lib/icons";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportsManagerProps {
  initialReports: ReportWithAssignments[];
  categories: Category[];
}

const EMPTY_FORM = {
  name: "",
  description: "",
  powerbi_url: "",
  category_id: "",
  icon: "BarChart3",
  sort_order: 0,
  active: true,
  powerbi_workspace_id: "",
  powerbi_report_id: "",
};

export function ReportsManager({
  initialReports,
  categories,
}: ReportsManagerProps) {
  const router = useRouter();
  const [reports, setReports] =
    useState<ReportWithAssignments[]>(initialReports);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deletingReport, setDeletingReport] =
    useState<ReportWithAssignments | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports.filter((r) => {
      const matchTerm =
        !term ||
        r.name.toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term) ||
        (r.category || "").toLowerCase().includes(term);
      const matchCat =
        categoryFilter === "ALL" ||
        r.category_id === categoryFilter ||
        r.category === categoryFilter;
      return matchTerm && matchCat;
    });
  }, [reports, search, categoryFilter]);

  function openCreateModal() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      category_id: categories[0]?.id ?? "",
      sort_order: reports.length + 1,
    });
    setModalOpen(true);
  }

  function openEditModal(report: ReportWithAssignments) {
    setEditingId(report.id);
    setForm({
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
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    const selectedCat = categories.find((c) => c.id === form.category_id);
    const payload = {
      name: form.name,
      description: form.description,
      powerbi_url: form.powerbi_url,
      category_id: form.category_id || null,
      category: selectedCat?.name || "General",
      icon: form.icon,
      sort_order: Number(form.sort_order) || 0,
      active: form.active,
      powerbi_workspace_id: form.powerbi_workspace_id || null,
      powerbi_report_id: form.powerbi_report_id || null,
    };

    try {
      const url = editingId
        ? `/api/admin/reports/${editingId}`
        : "/api/admin/reports";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No fue posible guardar el informe.",
        });
        return;
      }

      if (editingId) {
        setReports((prev) =>
          prev
            .map((r) =>
              r.id === editingId
                ? {
                    ...r,
                    ...data.report,
                  }
                : r
            )
            .sort((a, b) => a.sort_order - b.sort_order)
        );
        setFeedback({
          type: "success",
          text: "Informe actualizado correctamente.",
        });
      } else {
        setReports((prev) =>
          [
            ...prev,
            {
              ...data.report,
              assigned_user_ids: [],
              assigned_users_count: 0,
            },
          ].sort((a, b) => a.sort_order - b.sort_order)
        );
        setFeedback({
          type: "success",
          text: `Informe "${data.report.name}" creado correctamente.`,
        });
      }

      setModalOpen(false);
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión al guardar." });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(
    report: ReportWithAssignments,
    nextActive: boolean
  ) {
    setFeedback(null);
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, active: nextActive } : r))
    );

    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      if (!res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id ? { ...r, active: !nextActive } : r
          )
        );
        setFeedback({
          type: "error",
          text: "No fue posible cambiar el estado del informe.",
        });
        return;
      }
      router.refresh();
    } catch {
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, active: !nextActive } : r
        )
      );
      setFeedback({ type: "error", text: "Error de conexión." });
    }
  }

  async function handleDelete() {
    if (!deletingReport) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/reports/${deletingReport.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setFeedback({
          type: "error",
          text: data.error || "No se pudo eliminar el informe.",
        });
        return;
      }
      setReports((prev) => prev.filter((r) => r.id !== deletingReport.id));
      setDeletingReport(null);
      setFeedback({
        type: "success",
        text: "Informe eliminado correctamente.",
      });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  const PreviewIcon = getIconByName(form.icon);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Gestión de informes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administre los informes de Power BI, sus enlaces de inserción,
            categorías, orden de visualización y vigencia.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Nuevo informe
        </Button>
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

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar informe por nombre, descripción o categoría..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Orden</TableHead>
                <TableHead>Informe</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                    No se encontraron informes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
                  const Icon = getIconByName(report.icon);
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs text-slate-500">
                        #{report.sort_order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 max-w-md">
                            <Link
                              href={`/admin/informes/${report.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                            >
                              {report.name}
                            </Link>
                            {report.description && (
                              <p className="truncate text-xs text-slate-500">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/informes/${report.id}`}
                          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          {report.assigned_users_count}{" "}
                          {report.assigned_users_count === 1
                            ? "usuario"
                            : "usuarios"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={report.active}
                            onCheckedChange={(checked) =>
                              handleToggleActive(report, checked)
                            }
                            aria-label={`Activar o desactivar ${report.name}`}
                          />
                          <span className="text-xs text-slate-600">
                            {report.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(report.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Abrir en visor intranet"
                          >
                            <Link href={`/intranet/reportes/${report.id}`}>
                              <ExternalLink className="h-4 w-4 text-slate-600" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Detalle y usuarios con acceso"
                          >
                            <Link href={`/admin/informes/${report.id}`}>
                              <Settings2 className="h-4 w-4 text-slate-600" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(report)}
                            title="Edición rápida"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingReport(report)}
                            title="Eliminar informe"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Crear / Editar Informe */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar informe Power BI" : "Crear informe Power BI"}
            </DialogTitle>
            <DialogDescription>
              Configure la información y el enlace seguro HTTPS de Power BI.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Nombre del informe *</Label>
              <Input
                id="r-name"
                required
                placeholder="Ej. Estado de Resultados"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="r-desc">Descripción</Label>
              <Textarea
                id="r-desc"
                rows={2}
                placeholder="Breve resumen del propósito e indicadores del informe..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="r-url">URL Power BI (HTTPS) *</Label>
              <Input
                id="r-url"
                type="url"
                required
                placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
                value={form.powerbi_url}
                onChange={(e) =>
                  setForm({ ...form, powerbi_url: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label>Categoría</Label>
                <Select
                  value={form.category_id || "NONE"}
                  onValueChange={(val) =>
                    setForm({ ...form, category_id: val === "NONE" ? "" : val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
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
                      {AVAILABLE_ICONS.map((iconName) => (
                        <SelectItem key={iconName} value={iconName}>
                          {iconName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-order">Orden</Label>
                <Input
                  id="r-order"
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
              <div>
                <p className="text-xs font-medium text-slate-900">
                  Informe activo
                </p>
                <p className="text-[11px] text-slate-500">
                  Solo los informes activos son visibles para los usuarios asignados.
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, active: checked })
                }
              />
            </div>

            {/* Campos preparados para futura migración a Power BI Embedded */}
            <details className="rounded-lg border border-slate-200/80 px-3.5 py-2.5">
              <summary className="cursor-pointer text-xs font-medium text-slate-600">
                Configuración avanzada (Futura integración Power BI Embedded)
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="r-ws" className="text-[11px]">
                    Workspace ID (Opcional)
                  </Label>
                  <Input
                    id="r-ws"
                    placeholder="GUID de Workspace"
                    value={form.powerbi_workspace_id}
                    onChange={(e) =>
                      setForm({ ...form, powerbi_workspace_id: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="r-rid" className="text-[11px]">
                    Report ID (Opcional)
                  </Label>
                  <Input
                    id="r-rid"
                    placeholder="GUID de Informe"
                    value={form.powerbi_report_id}
                    onChange={(e) =>
                      setForm({ ...form, powerbi_report_id: e.target.value })
                    }
                  />
                </div>
              </div>
            </details>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Guardar cambios" : "Crear informe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog
        open={Boolean(deletingReport)}
        onOpenChange={(open) => !open && setDeletingReport(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar informe</DialogTitle>
            <DialogDescription>
              ¿Seguro que desea eliminar el informe{" "}
              <strong>{deletingReport?.name}</strong>? Se eliminarán también las
              asignaciones asociadas a todos los usuarios.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingReport(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar informe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
