"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import type { Profile, Report } from "@/types/database";
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
  report_id: string;
}

interface AssignmentsManagerProps {
  users: Profile[];
  reports: Report[];
  initialAssignments: AssignmentRow[];
}

export function AssignmentsManager({
  users,
  reports,
  initialAssignments,
}: AssignmentsManagerProps) {
  const router = useRouter();
  const [assignments, setAssignments] =
    useState<AssignmentRow[]>(initialAssignments);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users[0]?.id ?? ""
  );
  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports[0]?.id ?? ""
  );
  const [userSearch, setUserSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const assignmentSet = useMemo(() => {
    const set = new Set<string>();
    for (const a of assignments) {
      set.add(`${a.user_id}:${a.report_id}`);
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

  const reportCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assignments) {
      map.set(a.report_id, (map.get(a.report_id) ?? 0) + 1);
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

  const filteredReports = useMemo(() => {
    const term = reportSearch.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        (r.category || "").toLowerCase().includes(term)
    );
  }, [reports, reportSearch]);

  const groupedReports = useMemo(() => {
    const groups = new Map<string, Report[]>();
    for (const r of reports) {
      const cat = r.category || "General";
      const list = groups.get(cat) ?? [];
      list.push(r);
      groups.set(cat, list);
    }
    return Array.from(groups.entries());
  }, [reports]);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;
  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? null;

  async function toggleAssignment(
    userId: string,
    reportId: string,
    nextAssigned: boolean
  ) {
    const key = `${userId}:${reportId}`;
    setBusyKey(key);
    setFeedback(null);

    const previous = assignments;
    setAssignments((prev) =>
      nextAssigned
        ? [...prev, { user_id: userId, report_id: reportId }]
        : prev.filter(
            (a) => !(a.user_id === userId && a.report_id === reportId)
          )
    );

    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          report_id: reportId,
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

  async function setAllReportsForUser(userId: string, assignAll: boolean) {
    setBusyKey(`bulk:${userId}`);
    setFeedback(null);
    const previous = assignments;
    const reportIds = assignAll ? reports.map((r) => r.id) : [];

    setAssignments((prev) => {
      const others = prev.filter((a) => a.user_id !== userId);
      const next = reportIds.map((rid) => ({
        user_id: userId,
        report_id: rid,
      }));
      return [...others, ...next];
    });

    try {
      const res = await fetch("/api/admin/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, report_ids: reportIds }),
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
          ? "Todos los informes fueron asignados."
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
          Asignación de Informes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestione qué informes puede visualizar cada usuario o consulte quiénes
          tienen acceso a cada informe. Los cambios se persisten al instante en
          Supabase.
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
          <TabsTrigger value="by-report" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Consultar por Informe
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
                          ? "border-slate-900 bg-slate-900 text-white"
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
                        {userCounts.get(selectedUser.id) ?? 0} de {reports.length}{" "}
                        informes asignados
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyKey === `bulk:${selectedUser.id}`}
                        onClick={() =>
                          setAllReportsForUser(selectedUser.id, true)
                        }
                      >
                        Asignar todos
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyKey === `bulk:${selectedUser.id}`}
                        onClick={() =>
                          setAllReportsForUser(selectedUser.id, false)
                        }
                      >
                        Quitar todos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    {groupedReports.map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {category}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {items.map((report) => {
                            const Icon = getIconByName(report.icon);
                            const key = `${selectedUser.id}:${report.id}`;
                            const checked = assignmentSet.has(key);
                            const busy =
                              busyKey === key ||
                              busyKey === `bulk:${selectedUser.id}`;

                            return (
                              <label
                                key={report.id}
                                className={cn(
                                  "flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                                  checked
                                    ? "border-blue-200 bg-blue-50/40"
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
                                        report.id,
                                        Boolean(val)
                                      )
                                    }
                                  />
                                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                                  <span className="truncate text-sm font-medium text-slate-800">
                                    {report.name}
                                  </span>
                                </div>
                                {busy && (
                                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-600" />
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

        {/* VISTA 2: POR INFORME */}
        <TabsContent value="by-report">
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Seleccionar Informe ({reports.length})
                </CardTitle>
                <div className="relative pt-2">
                  <Search className="pointer-events-none absolute left-3 top-[18px] h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Buscar informe..."
                    className="pl-9"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[540px] space-y-1.5 overflow-y-auto pt-0">
                {filteredReports.map((report) => {
                  const selected = report.id === selectedReportId;
                  const count = reportCounts.get(report.id) ?? 0;
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedReportId(report.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-transparent hover:bg-slate-100 text-slate-900"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {report.name}
                        </p>
                        <p
                          className={cn(
                            "truncate text-xs",
                            selected ? "text-slate-300" : "text-slate-500"
                          )}
                        >
                          {report.category}
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
              {selectedReport ? (
                <>
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle>{selectedReport.name}</CardTitle>
                    <CardDescription>
                      Categoría: {selectedReport.category} ·{" "}
                      {reportCounts.get(selectedReport.id) ?? 0} usuarios con
                      acceso explícito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-5">
                    {users.map((user) => {
                      const key = `${user.id}:${selectedReport.id}`;
                      const checked = assignmentSet.has(key);
                      const busy = busyKey === key;

                      return (
                        <label
                          key={user.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors",
                            checked
                              ? "border-blue-200 bg-blue-50/40"
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
                                  selectedReport.id,
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
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </CardContent>
                </>
              ) : (
                <CardContent className="py-12 text-center text-sm text-slate-500">
                  No existen informes registrados.
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
