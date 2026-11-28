"use client";

import { useMemo, useState } from "react";
import { RotateCcw, TrendingUp } from "lucide-react";
import type { RegisteredModuleProps } from "@/types/modules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export default function MarginSimulatorApp({
  module,
  profile,
}: RegisteredModuleProps) {
  const [revenue, setRevenue] = useState(48_000_000);
  const [directCosts, setDirectCosts] = useState(31_200_000);
  const [fixedExpenses, setFixedExpenses] = useState(9_500_000);
  const [priceDeltaPct, setPriceDeltaPct] = useState(0);
  const [costDeltaPct, setCostDeltaPct] = useState(0);

  const metrics = useMemo(() => {
    const simRevenue = Math.max(0, revenue * (1 + priceDeltaPct / 100));
    const simDirect = Math.max(0, directCosts * (1 + costDeltaPct / 100));
    const grossMargin = simRevenue - simDirect;
    const grossMarginPct = simRevenue > 0 ? (grossMargin / simRevenue) * 100 : 0;
    const ebitda = grossMargin - fixedExpenses;
    const ebitdaPct = simRevenue > 0 ? (ebitda / simRevenue) * 100 : 0;
    const contributionRatio = simRevenue > 0 ? grossMargin / simRevenue : 0;
    const breakEvenRevenue =
      contributionRatio > 0 ? fixedExpenses / contributionRatio : 0;
    const safetyMarginPct =
      simRevenue > 0 ? ((simRevenue - breakEvenRevenue) / simRevenue) * 100 : 0;

    return {
      simRevenue,
      simDirect,
      grossMargin,
      grossMarginPct,
      ebitda,
      ebitdaPct,
      breakEvenRevenue,
      safetyMarginPct,
    };
  }, [revenue, directCosts, fixedExpenses, priceDeltaPct, costDeltaPct]);

  function resetScenario() {
    setRevenue(48_000_000);
    setDirectCosts(31_200_000);
    setFixedExpenses(9_500_000);
    setPriceDeltaPct(0);
    setCostDeltaPct(0);
  }

  const positiveEbitda = metrics.ebitda >= 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">Aplicación Nativa Findex</Badge>
            <Badge variant="amber">Interactiva</Badge>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-[#0D1B2A]">
            {module.name}
          </h2>
          <p className="text-xs text-slate-500">
            Sesión de {profile.full_name} · Simule variaciones de ingresos, costos
            directos y punto de equilibrio en tiempo real.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetScenario}>
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer escenario
        </Button>
      </div>

      {/* KPIs en tiempo real */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/90 bg-[#0D1B2A] text-white">
          <CardContent className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Margen Bruto Simulado
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#D99A55]">
              {formatCLP(metrics.grossMargin)}
            </p>
            <p className="mt-1 text-xs text-[#159F91]">
              {metrics.grossMarginPct.toFixed(1)} % sobre ingresos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Resultado Operacional (EBITDA)
            </p>
            <p
              className={`mt-1.5 text-2xl font-bold ${
                positiveEbitda ? "text-[#0F7E73]" : "text-red-600"
              }`}
            >
              {formatCLP(metrics.ebitda)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Margen EBITDA: {metrics.ebitdaPct.toFixed(1)} %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Punto de Equilibrio
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#0D1B2A]">
              {formatCLP(metrics.breakEvenRevenue)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Venta mínima mensual sin pérdida
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#FDF6EC]/70 border-[#D99A55]/35">
          <CardContent className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#9A6324]">
              Margen de Seguridad
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#0D1B2A]">
              {metrics.safetyMarginPct.toFixed(1)} %
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Holgura sobre punto de equilibrio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles y desglose */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Parámetros base y sensibilidad</CardTitle>
            <CardDescription>
              Ajuste cifras mensuales (CLP) y pruebe variaciones porcentuales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="sim-rev">Ingresos base (CLP)</Label>
                <Input
                  id="sim-rev"
                  type="number"
                  min={0}
                  step={500000}
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sim-cost">Costos directos (CLP)</Label>
                <Input
                  id="sim-cost"
                  type="number"
                  min={0}
                  step={500000}
                  value={directCosts}
                  onChange={(e) => setDirectCosts(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sim-fixed">Gastos fijos (CLP)</Label>
                <Input
                  id="sim-fixed"
                  type="number"
                  min={0}
                  step={250000}
                  value={fixedExpenses}
                  onChange={(e) => setFixedExpenses(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">
                    Variación de precio / volumen de ventas
                  </span>
                  <span className="font-semibold text-[#0F7E73]">
                    {priceDeltaPct > 0 ? `+${priceDeltaPct}%` : `${priceDeltaPct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  step={1}
                  value={priceDeltaPct}
                  onChange={(e) => setPriceDeltaPct(Number(e.target.value))}
                  className="w-full accent-[#159F91]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">
                    Variación de costos directos (materiales / HH)
                  </span>
                  <span className="font-semibold text-[#B97A35]">
                    {costDeltaPct > 0 ? `+${costDeltaPct}%` : `${costDeltaPct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  step={1}
                  value={costDeltaPct}
                  onChange={(e) => setCostDeltaPct(Number(e.target.value))}
                  className="w-full accent-[#D99A55]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#159F91]" />
              Composición del Resultado
            </CardTitle>
            <CardDescription>
              Proporción sobre ingresos simulados ({formatCLP(metrics.simRevenue)})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Costos directos",
                value: metrics.simDirect,
                pct:
                  metrics.simRevenue > 0
                    ? (metrics.simDirect / metrics.simRevenue) * 100
                    : 0,
                color: "bg-[#0D1B2A]",
              },
              {
                label: "Gastos fijos",
                value: fixedExpenses,
                pct:
                  metrics.simRevenue > 0
                    ? (fixedExpenses / metrics.simRevenue) * 100
                    : 0,
                color: "bg-[#D99A55]",
              },
              {
                label: "EBITDA resultante",
                value: metrics.ebitda,
                pct: Math.max(0, metrics.ebitdaPct),
                color: "bg-[#159F91]",
              },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{row.label}</span>
                  <span className="font-semibold text-[#0D1B2A]">
                    {formatCLP(row.value)} ({row.pct.toFixed(1)} %)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${row.color}`}
                    style={{ width: `${Math.min(100, Math.max(0, row.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
