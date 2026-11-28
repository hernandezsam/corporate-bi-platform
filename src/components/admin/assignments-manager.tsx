"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import type { Profile } from "@/types/database";
import {
  MODULE_TYPE_LABELS,
  type CorporateModule,
} from "@/types/modules";
import { getIconByName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface AssignmentRow {
  user_id: string;
  module_id: string;
}

interface AssignmentsManagerProps {
  users: Profile[];
  modules: CorporateModule[];
  initialAssignments: AssignmentRow[];
}

export function AssignmentsManager({
  users,
  modules,
  initialAssignments,
}: AssignmentsManagerProps) {
  const router = useRouter();
  const [assignments, setAssignments] =
    useState<AssignmentRow[]>(initialAssignments);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users[0]?.id ?? ""
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    modules[0]?.id ?? ""
  );
  const [userSearch, setUserSearch] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const assignmentSet = useMemo(() => {
    const set = new Set<string>();
    for (const a of assignments) {
      set.add(`${a.user_id}:${a.module_id}`);
    }
    return set;
  }, [assignments]);

  const userCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assignments) {
      map.set(a.user_id, (map.get(a.user_id) ?? 0) + 1);
    }
    return map;
  }, [assignments]);

  const moduleCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assignments) {
      map.set(a.module_id, (map.get(a.module_id) ?? 0) + 1);
    }
    return map;
  }, [assignments]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  const filteredModules = useMemo(() => {
    const term = moduleSearch.trim().toLowerCase();
    if (!term) return modules;
    return modules.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.category || "").toLowerCase().includes(term) ||
        MODULE_TYPE_LABELS[m.module_type].toLowerCase().includes(term)
    );
  }, [modules, moduleSearch]);

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

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;
  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;

  async function toggleAssignment(
    userId: string,
    moduleId: string,
    nextAssigned: boolean
  ) {
    const key = `${userId}:${moduleId}`;
    setBusyKey(key);
    setFeedback(null);

    const previous = assignments;
    setAssignments((prev) =>
      nextAssigned
        ? [...prev, { user_id: userId, module_id: moduleId }]
        : prev.filter(
            (a) => !(a.user_id === userId && a.module_id === moduleId)
          )
    );

    try {
      const res = await fetch("/api/admin/module-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          module_id: moduleId,
          assigned: nextAssigned,
        }),
      });
      if (!res.ok) {
        setAssignments(previous);
        const data = await res.json();
        setFeedback({
          type: "error",
          text: data.error || "Error al guardar la asignación.",
        });
        return;
      }
      router.refresh();
    } catch {
      setAssignments(previous);
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setBusyKey(null);
    }
  }

  async function setAllModulesForUser(userId: string, assignAll: boolean) {
    setBusyKey(`bulk:${userId}`);
    setFeedback(null);
    const previous = assignments;
    const moduleIds = assignAll ? modules.map((m) => m.id) : [];

    setAssignments((prev) => {
      const others = prev.filter((a) => a.user_id !== userId);
      const next = moduleIds.map((mid) => ({
        user_id: userId,
        module_id: mid,
      }));
      return [...others, ...next];
    });

    try {
      const res = await fetch("/api/admin/module-assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, module_ids: moduleIds }),
      });
      if (!res.ok) {
        setAssignments(previous);
        setFeedback({
          type: "error",
          text: "No se pudo actualizar masivamente.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: assignAll
          ? "Todos los módulos fueron asignados."
          : "Todas las asignaciones del usuario fueron revocadas.",
      });
      router.refresh();
    } catch {
      setAssignments(previous);
      setFeedback({ type: "error", text: "Error de conexión." });
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Asignación de Módulos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestione qué informes Power BI, aplicaciones, documentos PDF y
          herramientas puede abrir cada usuario. Los cambios se persisten al
          instante en Supabase.
        </p>
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

      <Tabs defaultValue="by-user">
        <TabsList>
          <TabsTrigger value="by-user" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Asignar por Usuario
          </TabsTrigger>
          <TabsTrigger value="by-module" className="gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            Consultar por Módulo
          </TabsTrigger>
        </TabsList>

        {/* VISTA 1: POR USUARIO */}
        <TabsContent value="by-user">
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Seleccionar Usuario ({users.length})
                </CardTitle>
                <div className="relative pt-2">
                  <Search className="pointer-events-none absolute left-3 top-[18px] h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Buscar usuario..."
                    className="pl-9"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[540px] space-y-1.5 overflow-y-auto pt-0">
                {filteredUsers.map((user) => {
                  const selected = user.id === selectedUserId;
                  const count = userCounts.get(user.id) ?? 0;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-[#0D1B2A] bg-[#0D1B2A] text-white"
                          : "border-transparent hover:bg-slate-100 text-slate-900"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.full_name}
                        </p>
                        <p
                          className={cn(
                            "truncate text-xs",
                            selected ? "text-slate-300" : "text-slate-500"
                          )}
                        >
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant={selected ? "outline" : "secondary"}
                        className={cn(
                          "shrink-0 text-[10px]",
                          selected && "border-white/25 bg-white/10 text-white"
                        )}
                      >
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="lg:col-span-8">
              {selectedUser ? (
                <>
                  <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>{selectedUser.full_name}</CardTitle>
                      <CardDescription>
                        {selectedUser.email} · Rol: {selectedUser.role} ·{" "}
                        {userCounts.get(selectedUser.id) ?? 0} de{" "}
                        {modules.length} módulos asignados
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyKey === `bulk:${selectedUser.id}`}
                        onClick={() =>
                          setAllModulesForUser(selectedUser.id, true)
                        }
                      >
                        Asignar todos
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyKey === `bulk:${selectedUser.id}`}
                        onClick={() =>
                          setAllModulesForUser(selectedUser.id, false)
                        }
                      >
                        Quitar todos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    {groupedModules.map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {category}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {items.map((mod) => {
                            const Icon = getIconByName(mod.icon);
                            const key = `${selectedUser.id}:${mod.id}`;
                            const checked = assignmentSet.has(key);
                            const busy =
                              busyKey === key ||
                              busyKey === `bulk:${selectedUser.id}`;

                            return (
                              <label
                                key={mod.id}
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
                                      toggleAssignment(
                                        selectedUser.id,
                                        mod.id,
                                        Boolean(val)
                                      )
                                    }
                                  />
                                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-800">
                                      {mod.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {MODULE_TYPE_LABELS[mod.module_type]}
                                    </p>
                                  </div>
                                </div>
                                {busy && (
                                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#159F91]" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </>
              ) : (
                <CardContent className="py-12 text-center text-sm text-slate-500">
                  No existen usuarios registrados.
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* VISTA 2: POR MÓDULO */}
        <TabsContent value="by-module">
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Seleccionar Módulo ({modules.length})
                </CardTitle>
                <div className="relative pt-2">
                  <Search className="pointer-events-none absolute left-3 top-[18px] h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Buscar módulo..."
                    className="pl-9"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[540px] space-y-1.5 overflow-y-auto pt-0">
                {filteredModules.map((mod) => {
                  const selected = mod.id === selectedModuleId;
                  const count = moduleCounts.get(mod.id) ?? 0;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-[#0D1B2A] bg-[#0D1B2A] text-white"
                          : "border-transparent hover:bg-slate-100 text-slate-900"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {mod.name}
                        </p>
                        <p
                          className={cn(
                            "truncate text-xs",
                            selected ? "text-slate-300" : "text-slate-500"
                          )}
                        >
                          {MODULE_TYPE_LABELS[mod.module_type]} · {mod.category}
                        </p>
                      </div>
                      <Badge
                        variant={selected ? "outline" : "secondary"}
                        className={cn(
                          "shrink-0 text-[10px]",
                          selected && "border-white/25 bg-white/10 text-white"
                        )}
                      >
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="lg:col-span-8">
              {selectedModule ? (
                <>
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{selectedModule.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        {MODULE_TYPE_LABELS[selectedModule.module_type]}
                      </Badge>
                    </div>
                    <CardDescription>
                      Categoría: {selectedModule.category} ·{" "}
                      {moduleCounts.get(selectedModule.id) ?? 0} usuarios con
                      acceso explícito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-5">
                    {users.map((user) => {
                      const key = `${user.id}:${selectedModule.id}`;
                      const checked = assignmentSet.has(key);
                      const busy = busyKey === key;

                      return (
                        <label
                          key={user.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors",
                            checked
                              ? "border-[#159F91]/40 bg-[#EBF7F5]/60"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Checkbox
                              checked={checked}
                              disabled={busy}
                              onCheckedChange={(val) =>
                                toggleAssignment(
                                  user.id,
                                  selectedModule.id,
                                  Boolean(val)
                                )
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
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={
                                user.role === "ADMIN" ? "info" : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {user.role}
                            </Badge>
                            {!user.active && (
                              <Badge
                                variant="destructive"
                                className="text-[10px]"
                              >
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
                  </CardContent>
                </>
              ) : (
                <CardContent className="py-12 text-center text-sm text-slate-500">
                  No existen módulos registrados.
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
