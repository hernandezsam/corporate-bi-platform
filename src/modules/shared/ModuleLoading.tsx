"use client";

import { Loader2 } from "lucide-react";

interface ModuleLoadingProps {
  label?: string;
}

export function ModuleLoading({
  label = "Cargando módulo...",
}: ModuleLoadingProps) {
  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-3 bg-slate-50/90 p-6">
      <Loader2 className="h-7 w-7 animate-spin text-[#159F91]" />
      <p className="text-xs font-medium text-slate-600">{label}</p>
    </div>
  );
}
