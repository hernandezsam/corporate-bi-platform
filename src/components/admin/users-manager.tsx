"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import type { ProfileWithAssignments, UserRole } from "@/types/database";
import {
  MODULE_TYPE_LABELS,
  type CorporateModule,
} from "@/types/modules";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

interface UsersManagerProps {
  initialUsers: ProfileWithAssignments[];
  modules: CorporateModule[];
  currentAdminId: string;
}

export function UsersManager({
  initialUsers,
  modules,
  currentAdminId,
}: UsersManagerProps) {
  const router = useRouter();
  const [users, setUsers] = useState<ProfileWithAssignments[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal Crear Usuario
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "USER" as UserRole,
    active: true,
    module_ids: [] as string[],
  });

  // Modal Edición Rápida
  const [editingUser, setEditingUser] = useState<ProfileWithAssignments | null>(
    null
  );
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "USER" as UserRole,
    active: true,
    password: "",
  });

  // Modal Eliminar
  const [deletingUser, setDeletingUser] =
    useState<ProfileWithAssignments | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchTerm =
        !term ||
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? u.active : !u.active);
      return matchTerm && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function toggleCreateModule(moduleId: string, checked: boolean) {
    setCreateForm((prev) => ({
      ...prev,
      module_ids: checked
        ? [...prev.module_ids, moduleId]
        : prev.module_ids.filter((id) => id !== moduleId),
    }));
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No se pudo crear el usuario.",
        });
        return;
      }

      setUsers((prev) => [data.user, ...prev]);
      setCreateOpen(false);
      setCreateForm({
        full_name: "",
        email: "",
        password: "",
        role: "USER",
        active: true,
        module_ids: [],
      });
      setFeedback({
        type: "success",
        text: `Usuario "${data.user.full_name}" creado correctamente.`,
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión al crear usuario." });
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(user: ProfileWithAssignments) {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name,
      role: user.role,
      active: user.active,
      password: "",
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setFeedback(null);
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No se pudo actualizar el usuario.",
        });
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                full_name: data.user.full_name,
                role: data.user.role,
                active: data.user.active,
              }
            : u
        )
      );
      setEditingUser(null);
      setFeedback({
        type: "success",
        text: "Usuario actualizado correctamente.",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Error de conexión al actualizar." });
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleToggleActive(
    user: ProfileWithAssignments,
    nextActive: boolean
  ) {
    setFeedback(null);
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, active: nextActive } : u))
    );
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Rollback
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, active: !nextActive } : u
          )
        );
        setFeedback({
          type: "error",
          text: data.error || "No se pudo cambiar el estado del usuario.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: `Usuario ${nextActive ? "activado" : "desactivado"} correctamente.`,
      });
      router.refresh();
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: !nextActive } : u))
      );
      setFeedback({ type: "error", text: "Error de conexión." });
    }
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "No fue posible eliminar el usuario.",
        });
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
      setFeedback({
        type: "success",
        text: "Usuario y sus asignaciones eliminados correctamente.",
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
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cree cuentas mediante la API segura de Supabase Auth, asigne roles y
            controle el acceso a la intranet.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo usuario
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
            placeholder="Buscar por nombre o correo electrónico..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los roles</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="INACTIVE">Desactivados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    No se encontraron usuarios con los criterios aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentAdminId;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <Link
                            href={`/admin/usuarios/${user.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                          >
                            {user.full_name}
                          </Link>
                          {isSelf && (
                            <span className="ml-2 text-[10px] font-medium text-blue-600">
                              (Tú)
                            </span>
                          )}
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "ADMIN" ? "info" : "secondary"}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.active}
                            disabled={isSelf}
                            onCheckedChange={(checked) =>
                              handleToggleActive(user, checked)
                            }
                            aria-label={`Activar o desactivar a ${user.full_name}`}
                          />
                          <span className="text-xs text-slate-600">
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/usuarios/${user.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          {user.assigned_reports_count}{" "}
                          {user.assigned_reports_count === 1
                            ? "módulo"
                            : "módulos"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title="Gestionar permisos y detalle"
                          >
                            <Link href={`/admin/usuarios/${user.id}`}>
                              <Settings2 className="h-4 w-4 text-slate-600" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(user)}
                            title="Editar datos"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isSelf}
                            onClick={() => setDeletingUser(user)}
                            title="Eliminar usuario"
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

      {/* Dialog Crear Usuario */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
            <DialogDescription>
              El usuario se creará en Supabase Auth con confirmación automática y
              perfil corporativo asociado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Nombre completo *</Label>
                <Input
                  id="c-name"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={createForm.full_name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Correo electrónico *</Label>
                <Input
                  id="c-email"
                  type="email"
                  required
                  placeholder="cmendoza@empresa.com"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-password">Contraseña inicial *</Label>
                <Input
                  id="c-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rol *</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(val) =>
                    setCreateForm({ ...createForm, role: val as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER (Solo módulos asignados)</SelectItem>
                    <SelectItem value="ADMIN">ADMIN (Acceso administrativo total)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div>
                <p className="text-xs font-medium text-slate-800">Usuario activo</p>
                <p className="text-[11px] text-slate-500">
                  Permitir inicio de sesión inmediatamente tras la creación.
                </p>
              </div>
              <Switch
                checked={createForm.active}
                onCheckedChange={(checked) =>
                  setCreateForm({ ...createForm, active: checked })
                }
              />
            </div>

            {modules.length > 0 && (
              <div className="space-y-2">
                <Label>Asignar módulos iniciales (opcional)</Label>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                  {modules.map((mod) => {
                    const checked = createForm.module_ids.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className="flex cursor-pointer items-center gap-2.5 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) =>
                            toggleCreateModule(mod.id, Boolean(val))
                          }
                        />
                        <span className="flex-1 truncate text-slate-800">
                          {mod.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {MODULE_TYPE_LABELS[mod.module_type]} · {mod.category}
                        </span>
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
                Crear usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Usuario */}
      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifique los datos de {editingUser?.email}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Nombre completo</Label>
              <Input
                id="e-name"
                required
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select
                value={editForm.role}
                disabled={editingUser?.id === currentAdminId}
                onValueChange={(val) =>
                  setEditForm({ ...editForm, role: val as UserRole })
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
              <Label htmlFor="e-password">
                Nueva contraseña (dejar vacío para no cambiar)
              </Label>
              <Input
                id="e-password"
                type="password"
                minLength={8}
                placeholder="••••••••"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <span className="text-xs font-medium text-slate-800">
                Cuenta activa
              </span>
              <Switch
                checked={editForm.active}
                disabled={editingUser?.id === currentAdminId}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, active: checked })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente a{" "}
              <strong>{deletingUser?.full_name}</strong> ({deletingUser?.email}),
              su perfil y todas sus asignaciones de informes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
