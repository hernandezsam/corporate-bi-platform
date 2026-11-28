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
  Trash2,
  Users,
} from "lucide-react";
import type { Category, Profile } from "@/types/database";
import {
  DEFAULT_RENDER_MODE_BY_TYPE,
  MODULE_TYPE_LABELS,
  type ModuleConfig,
  type ModuleType,
  type ModuleWithAssignments,
} from "@/types/modules";
import { REGISTERED_APPS_META } from "@/modules/registry-meta";
import { AVAILABLE_ICONS, getIconByName } from "@/lib/icons";
import { slugify } from "@/lib/security";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

interface ModulesManagerProps {
  initialModules: ModuleWithAssignments[];
  categories: Category[];
  users: Profile[];
}

const SANDBOX_OPTIONS = [
  { id: "allow-scripts", label: "Ejecutar scripts (allow-scripts)" },
  { id: "allow-forms", label: "Enviar formularios (allow-forms)" },
  { id: "allow-popups", label: "Abrir ventanas emergentes (allow-popups)" },
  { id: "allow-downloads", label: "Permitir descargas (allow-downloads)" },
  { id: "allow-modals", label: "Mostrar diálogos (allow-modals)" },
] as const;

const TYPE_BADGE_CLASSES: Record<ModuleType, string> = {
  POWERBI: "border-[#0D1B2A]/20 bg-[#0D1B2A]/5 text-[#0D1B2A]",
  APP: "border-[#159F91]/30 bg-[#EBF7F5] text-[#0F7E73]",
  TOOL: "border-[#D99A55]/40 bg-[#FDF6EC] text-[#B97A35]",
  HTML: "border-indigo-200 bg-indigo-50 text-indigo-700",
  PDF: "border-rose-200 bg-rose-50 text-rose-700",
};

interface CreateFormState {
  name: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  category_id: string;
  module_type: ModuleType;
  source_url: string;
  icon: string;
  sort_order: number;
  active: boolean;
  // Config condicional
  app_key: string;
  embed_mode: "direct_url" | "powerbi_embedded";
  powerbi_workspace_id: string;
  powerbi_report_id: string;
  sandbox: string[];
  allow_download: boolean;
  open_toolbar: boolean;
  user_ids: string[];
}

function makeDefaultForm(categories: Category[]): CreateFormState {
  return {
    name: "",
    slug: "",
    slugTouched: false,
    description: "",
    category_id: categories[0]?.id ?? "",
    module_type: "POWERBI",
    source_url: "",
    icon: "BarChart3",
    sort_order: 0,
    active: true,
    app_key: REGISTERED_APPS_META[0]?.key ?? "",
    embed_mode: "direct_url",
    powerbi_workspace_id: "",
    powerbi_report_id: "",
    sandbox: ["allow-scripts", "allow-forms"],
    allow_download: false,
    open_toolbar: true,
    user_ids: [],
  };
}

export function ModulesManager({
  initialModules,
  categories,
  users,
}: ModulesManagerProps) {
  const router = useRouter();
  const [modules, setModules] =
    useState<ModuleWithAssignments[]>(initialModules);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateFormState>(() =>
    makeDefaultForm(categories)
  );

  const [deletingMod, setDeletingMod] =
    useState<ModuleWithAssignments | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredModules = useMemo(() => {
    const term = search.trim().toLowerCase();
    return modules.filter((m) => {
      const matchTerm =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.slug.toLowerCase().includes(term) ||
        (m.description || "").toLowerCase().includes(term) ||
        (m.category || "").toLowerCase().includes(term);
      const matchType = typeFilter === "ALL" || m.module_type === typeFilter;
      const matchCat =
        categoryFilter === "ALL" ||
        m.category_id === categoryFilter ||
        m.category === categoryFilter;
      return matchTerm && matchType && matchCat;
    });
  }, [modules, search, typeFilter, categoryFilter]);

  function handleModuleTypeChange(nextType: ModuleType) {
    const defaultIconMap: Record<ModuleType, string> = {
      POWERBI: "BarChart3",
      APP: "Calculator",
      TOOL: "Wrench",
      HTML: "Code2",
      PDF: "FileText",
    };

    const matchingApp = REGISTERED_APPS_META.find(
      (a) => a.moduleType === nextType
    );

    setForm((prev) => ({
      ...prev,
      module_type: nextType,
      icon: defaultIconMap[nextType],
      app_key: matchingApp?.key ?? prev.app_key,
    }));
  }

  function handleSelectRegisteredApp(appKey: string) {
    const meta = REGISTERED_APPS_META.find((a) => a.key === appKey);
    setForm((prev) => {
      const nextName = prev.name.trim() ? prev.name : (meta?.label ?? "");
      return {
        ...prev,
        app_key: appKey,
        name: nextName,
        slug: prev.slugTouched ? prev.slug : slugify(nextName),
        description: prev.description.trim()
          ? prev.description
          : (meta?.description ?? ""),
        icon: meta?.defaultIcon ?? prev.icon,
      };
    });
  }

  function toggleSandbox(token: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      sandbox: checked
        ? Array.from(new Set([...prev.sandbox, token]))
        : prev.sandbox.filter((t) => t !== token),
    }));
  }

  function toggleInitialUser(userId: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      user_ids: checked
        ? [...prev.user_ids, userId]
        : prev.user_ids.filter((id) => id !== userId),
    }));
  }

  async function handleCreateModule(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setCreating(true);

    const selectedCat = categories.find((c) => c.id === form.category_id);

    let config: ModuleConfig = {};
    if (form.module_type === "POWERBI") {
      config = {
        embed_mode: form.embed_mode,
        powerbi_workspace_id: form.powerbi_workspace_id || null,
        powerbi_report_id: form.powerbi_report_id || null,
      };
    } else if (form.module_type === "APP" || form.module_type === "TOOL") {
      config = {
        app_key: form.app_key,
      };
    } else if (form.module_type === "HTML") {
      config = {
        sandbox: form.sandbox,
        allow: ["fullscreen"],
      };
    } else if (form.module_type === "PDF") {
      config = {
        allow_download: form.allow_download,
        open_toolbar: form.open_toolbar,
      };
    }

    const isInternal =
      form.module_type === "APP" || form.module_type === "TOOL";

    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug.trim() || undefined,
          description: form.description,
          category_id: form.category_id || null,
          category: selectedCat?.name || "General",
          module_type: form.module_type,
          render_mode: DEFAULT_RENDER_MODE_BY_TYPE[form.module_type],
          source_url: isInternal ? null : form.source_url.trim(),
          icon: form.icon,
          config,
          sort_order: Number(form.sort_order) || 0,
          active: form.active,
          user_ids: form.user_ids,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No se pudo crear el módulo.",
        });
        return;
      }

      setModules((prev) => [...prev, data.module]);
      setCreateOpen(false);
      setForm(makeDefaultForm(categories));
      setFeedback({
        type: "success",
        text: `Módulo "${data.module.name}" creado correctamente.`,
      });
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        text: "Error de conexión al crear el módulo.",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(
    mod: ModuleWithAssignments,
    nextActive: boolean
  ) {
    setFeedback(null);
    setModules((prev) =>
      prev.map((m) => (m.id === mod.id ? { ...m, active: nextActive } : m))
    );

    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      if (!res.ok) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === mod.id ? { ...m, active: !nextActive } : m
          )
        );
        const data = await res.json();
        setFeedback({
          type: "error",
          text: data.error || "No se pudo actualizar el estado del módulo.",
        });
        return;
      }
      router.refresh();
    } catch {
      setModules((prev) =>
        prev.map((m) => (m.id === mod.id ? { ...m, active: !nextActive } : m))
      );
      setFeedback({ type: "error", text: "Error de conexión." });
    }
  }

  async function handleDeleteModule() {
    if (!deletingMod) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/modules/${deletingMod.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No fue posible eliminar el módulo.",
        });
        return;
      }
      setModules((prev) => prev.filter((m) => m.id !== deletingMod.id));
      setDeletingMod(null);
      setFeedback({
        type: "success",
        text: "Módulo eliminado correctamente del catálogo.",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión al eliminar." });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Gestión de Módulos Corporativos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Incorpore y administre informes Power BI, aplicaciones React
            nativas, apps HTML seguras, documentos PDF y herramientas desde un
            catálogo unificado.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo módulo
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
            placeholder="Buscar módulo por nombre, slug o descripción..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[165px]">
              <SelectValue placeholder="Tipo de módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              <SelectItem value="POWERBI">Power BI</SelectItem>
              <SelectItem value="APP">Aplicación</SelectItem>
              <SelectItem value="TOOL">Herramienta</SelectItem>
              <SelectItem value="HTML">App HTML</SelectItem>
              <SelectItem value="PDF">Documento PDF</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Tabla de Módulos */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-center">Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-slate-500"
                  >
                    No se encontraron módulos con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules.map((mod) => {
                  const Icon = getIconByName(mod.icon);
                  return (
                    <TableRow key={mod.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[#0D1B2A]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/modulos/${mod.id}`}
                              className="block truncate font-medium text-slate-900 hover:text-[#159F91] hover:underline"
                            >
                              {mod.name}
                            </Link>
                            <p className="truncate font-mono text-[11px] text-slate-400">
                              /intranet/modulos/{mod.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold",
                            TYPE_BADGE_CLASSES[mod.module_type]
                          )}
                        >
                          {MODULE_TYPE_LABELS[mod.module_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {mod.category}
                      </TableCell>
                      <TableCell className="text-center text-xs text-slate-500">
                        {mod.sort_order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={mod.active}
                            onCheckedChange={(checked) =>
                              handleToggleActive(mod, checked)
                            }
                            aria-label={`Activar o desactivar ${mod.name}`}
                          />
                          <span className="text-xs text-slate-600">
                            {mod.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/modulos/${mod.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Users className="h-3 w-3 text-slate-500" />
                          {mod.assigned_users_count}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(mod.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Abrir en Intranet"
                          >
                            <Link
                              href={`/intranet/modulos/${mod.slug}`}
                              target="_blank"
                            >
                              <ExternalLink className="h-4 w-4 text-[#159F91]" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Editar módulo y permisos"
                          >
                            <Link href={`/admin/modulos/${mod.id}`}>
                              <Pencil className="h-4 w-4 text-slate-600" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingMod(mod)}
                            title="Eliminar módulo"
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

      {/* Dialog Crear Módulo */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incorporar nuevo módulo corporativo</DialogTitle>
            <DialogDescription>
              Configure el tipo de contenido, parámetros de seguridad y usuarios
              autorizados. El motor de renderizado elegirá automáticamente el
              visor correspondiente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateModule} className="space-y-4">
            {/* Tipo de módulo */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo de módulo *</Label>
                <Select
                  value={form.module_type}
                  onValueChange={(val) =>
                    handleModuleTypeChange(val as ModuleType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POWERBI">
                      Power BI (Informe embebido HTTPS)
                    </SelectItem>
                    <SelectItem value="APP">
                      Aplicación React nativa (Registrada)
                    </SelectItem>
                    <SelectItem value="TOOL">
                      Herramienta interactiva (Registrada)
                    </SelectItem>
                    <SelectItem value="HTML">
                      App HTML externa (iframe con sandbox)
                    </SelectItem>
                    <SelectItem value="PDF">
                      Documento PDF corporativo
                    </SelectItem>
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

            {/* Selector de aplicación registrada (para APP / TOOL) */}
            {(form.module_type === "APP" || form.module_type === "TOOL") && (
              <div className="space-y-1.5 rounded-lg border border-[#159F91]/30 bg-[#EBF7F5]/50 p-3.5">
                <Label>Aplicación / Herramienta registrada *</Label>
                <Select
                  value={form.app_key}
                  onValueChange={handleSelectRegisteredApp}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione componente interno" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTERED_APPS_META.map((app) => (
                      <SelectItem key={app.key} value={app.key}>
                        {app.label} ({app.moduleType} · v{app.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-600">
                  Por seguridad, solo los componentes registrados en{" "}
                  <code className="rounded bg-white px-1 py-0.5 text-[10px]">
                    src/modules/registry.ts
                  </code>{" "}
                  pueden instanciarse como módulos nativos.
                </p>
              </div>
            )}

            {/* Nombre y Slug */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="m-name">Nombre del módulo *</Label>
                <Input
                  id="m-name"
                  required
                  placeholder="Ej. Analizador de Cuentas Contables"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slugTouched ? prev.slug : slugify(name),
                    }));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-slug">Slug URL (único)</Label>
                <Input
                  id="m-slug"
                  placeholder="analizador-cuentas"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase(),
                      slugTouched: true,
                    }))
                  }
                />
                <p className="text-[11px] text-slate-400">
                  Ruta: /intranet/modulos/{form.slug || "auto-generado"}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="m-desc">Descripción</Label>
              <Textarea
                id="m-desc"
                rows={2}
                placeholder="Breve resumen visible en la tarjeta del catálogo..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            {/* Configuración específica POWERBI */}
            {form.module_type === "POWERBI" && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="m-pbi-url">URL HTTPS de Power BI *</Label>
                  <Input
                    id="m-pbi-url"
                    type="url"
                    required
                    placeholder="https://app.powerbi.com/view?r=..."
                    value={form.source_url}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        source_url: e.target.value,
                      }))
                    }
                  />
                  <p className="text-[11px] text-slate-500">
                    Solo se permiten dominios autorizados (*.powerbi.com,
                    *.fabric.microsoft.com).
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="m-ws" className="text-xs">
                      Workspace ID (opcional V2)
                    </Label>
                    <Input
                      id="m-ws"
                      placeholder="UUID del workspace"
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
                    <Label htmlFor="m-rid" className="text-xs">
                      Report ID (opcional V2)
                    </Label>
                    <Input
                      id="m-rid"
                      placeholder="UUID del reporte"
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

            {/* Configuración específica HTML */}
            {form.module_type === "HTML" && (
              <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="m-html-url">
                    URL HTTPS de la aplicación HTML *
                  </Label>
                  <Input
                    id="m-html-url"
                    type="url"
                    required
                    placeholder="https://apps.findex.cl/mi-dashboard"
                    value={form.source_url}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        source_url: e.target.value,
                      }))
                    }
                  />
                  <p className="text-[11px] text-slate-600">
                    El dominio debe estar habilitado en{" "}
                    <code className="rounded bg-white px-1">
                      ALLOWED_HTML_APP_HOSTS
                    </code>{" "}
                    (y{" "}
                    <code className="rounded bg-white px-1">
                      NEXT_PUBLIC_ALLOWED_HTML_HOSTS
                    </code>
                    ). Se aísla con sandbox estricto y sin compartir cookies ni
                    tokens.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">
                    Permisos explícitos del iframe (sandbox)
                  </Label>
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

            {/* Configuración específica PDF */}
            {form.module_type === "PDF" && (
              <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50/40 p-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="m-pdf-url">URL HTTPS del documento PDF *</Label>
                  <Input
                    id="m-pdf-url"
                    type="url"
                    required
                    placeholder="https://tu-proyecto.supabase.co/storage/v1/object/public/..."
                    value={form.source_url}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        source_url: e.target.value,
                      }))
                    }
                  />
                  <p className="text-[11px] text-slate-600">
                    Autorizado automáticamente para Supabase Storage (*.supabase.co)
                    y dominios en{" "}
                    <code className="rounded bg-white px-1">
                      ALLOWED_DOCUMENT_HOSTS
                    </code>
                    .
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                    <span className="text-xs font-medium text-slate-800">
                      Permitir descarga directa
                    </span>
                    <Switch
                      checked={form.allow_download}
                      onCheckedChange={(v) =>
                        setForm((prev) => ({ ...prev, allow_download: v }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                    <span className="text-xs font-medium text-slate-800">
                      Mostrar barra del visor PDF
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

            {/* Icono, Orden y Activo */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Icono Lucide</Label>
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
                <Label htmlFor="m-order">Orden visual</Label>
                <Input
                  id="m-order"
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
                    Módulo activo
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

            {/* Usuarios iniciales autorizados */}
            {users.length > 0 && (
              <div className="space-y-2">
                <Label>Asignar acceso inicial a usuarios (opcional)</Label>
                <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                  {users.map((u) => {
                    const checked = form.user_ids.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex cursor-pointer items-center justify-between gap-2 text-xs"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(val) =>
                              toggleInitialUser(u.id, Boolean(val))
                            }
                          />
                          <span className="truncate font-medium text-slate-800">
                            {u.full_name}
                          </span>
                          <span className="truncate text-slate-400">
                            ({u.email})
                          </span>
                        </span>
                        <Badge
                          variant={u.role === "ADMIN" ? "info" : "secondary"}
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear módulo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog
        open={Boolean(deletingMod)}
        onOpenChange={(open) => !open && setDeletingMod(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar módulo</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente{" "}
              <strong>{deletingMod?.name}</strong> del catálogo universal y
              revocará todas las asignaciones de usuarios asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingMod(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteModule}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar módulo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
