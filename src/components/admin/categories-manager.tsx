"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Category } from "@/types/database";
import { AVAILABLE_ICONS, getIconByName } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

interface CategoriesManagerProps {
  initialCategories: Category[];
}

const EMPTY_CATEGORY = {
  name: "",
  description: "",
  icon: "Folder",
  sort_order: 0,
  active: true,
};

export function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_CATEGORY, sort_order: categories.length + 1 });
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || "",
      icon: cat.icon || "Folder",
      sort_order: cat.sort_order ?? 0,
      active: cat.active,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sort_order: Number(form.sort_order) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No fue posible guardar la categoría.",
        });
        return;
      }

      if (editingId) {
        setCategories((prev) =>
          prev
            .map((c) => (c.id === editingId ? data.category : c))
            .sort((a, b) => a.sort_order - b.sort_order)
        );
        setFeedback({
          type: "success",
          text: "Categoría actualizada correctamente.",
        });
      } else {
        setCategories((prev) =>
          [...prev, data.category].sort((a, b) => a.sort_order - b.sort_order)
        );
        setFeedback({
          type: "success",
          text: "Categoría creada correctamente.",
        });
      }
      setModalOpen(false);
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(cat: Category, nextActive: boolean) {
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, active: nextActive } : c))
    );
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      if (!res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, active: !nextActive } : c))
        );
      } else {
        router.refresh();
      }
    } catch {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: !nextActive } : c))
      );
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: "No se pudo eliminar la categoría.",
        });
        return;
      }
      setCategories((prev) =>
        prev.filter((c) => c.id !== deletingCategory.id)
      );
      setDeletingCategory(null);
      setFeedback({
        type: "success",
        text: "Categoría eliminada correctamente.",
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
            Categorías de Informes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organice los informes de Power BI por áreas de negocio (Finanzas,
            Proyectos, RRHH, etc.).
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva categoría
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Orden</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    No existen categorías registradas.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => {
                  const Icon = getIconByName(cat.icon);
                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-mono text-xs text-slate-500">
                        #{cat.sort_order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {cat.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md text-xs text-slate-500">
                        {cat.description || "Sin descripción"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={cat.active}
                            onCheckedChange={(checked) =>
                              handleToggleActive(cat, checked)
                            }
                          />
                          <span className="text-xs text-slate-600">
                            {cat.active ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(cat)}
                            title="Editar categoría"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCategory(cat)}
                            title="Eliminar categoría"
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              Al renombrar una categoría, los informes asociados se actualizan
              automáticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nombre *</Label>
              <Input
                id="cat-name"
                required
                placeholder="Ej. Finanzas"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Descripción</Label>
              <Textarea
                id="cat-desc"
                rows={2}
                placeholder="Descripción de la categoría..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Icono</Label>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                    <PreviewIcon className="h-4 w-4" />
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
                <Label htmlFor="cat-order">Orden</Label>
                <Input
                  id="cat-order"
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
                Categoría activa
              </span>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, active: checked })
                }
              />
            </div>

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
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Desea eliminar la categoría{" "}
              <strong>{deletingCategory?.name}</strong>? Los informes que la
              utilizaban se mantendrán intactos sin eliminarse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCategory(null)}
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
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
