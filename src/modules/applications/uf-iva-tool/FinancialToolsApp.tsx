"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import type { RegisteredModuleProps } from "@/types/modules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(n) ? n : 0);
}

export default function FinancialToolsApp({
  module,
}: RegisteredModuleProps) {
  // 1. Conversor UF <-> CLP
  const [ufRate, setUfRate] = useState(38_500);
  const [ufAmount, setUfAmount] = useState(100);

  // 2. IVA 19% Neto <-> Bruto
  const [netAmount, setNetAmount] = useState(1_000_000);

  // 3. Margen sobre venta vs Markup sobre costo
  const [unitCost, setUnitCost] = useState(650_000);
  const [targetMarginPct, setTargetMarginPct] = useState(35);

  const clpTotal = ufAmount * ufRate;
  const ivaValue = netAmount * 0.19;
  const grossAmount = netAmount + ivaValue;

  const safeMargin = Math.min(95, Math.max(0, targetMarginPct));
  const sellingPrice =
    safeMargin < 100 ? unitCost / (1 - safeMargin / 100) : unitCost;
  const markupPct =
    unitCost > 0 ? ((sellingPrice - unitCost) / unitCost) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="amber">Herramienta Corporativa</Badge>
          <Badge variant="info">Cálculo instantáneo</Badge>
        </div>
        <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[#0D1B2A]">
          <Calculator className="h-5 w-5 text-[#159F91]" />
          {module.name}
        </h2>
        <p className="text-xs text-slate-500">
          Utilidades rápidas de conversión UF, cálculo de IVA (19 %) y fijación
          de precios por margen objetivo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* UF <-> CLP */}
        <Card>
          <CardHeader>
            <CardTitle>Conversor UF ↔ CLP</CardTitle>
            <CardDescription>
              Ajuste el valor referencia de la UF del día.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="uf-rate">Valor UF referencial (CLP)</Label>
              <Input
                id="uf-rate"
                type="number"
                min={1}
                step={10}
                value={ufRate}
                onChange={(e) => setUfRate(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uf-qty">Monto en UF</Label>
              <Input
                id="uf-qty"
                type="number"
                min={0}
                step={0.5}
                value={ufAmount}
                onChange={(e) => setUfAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="rounded-lg bg-[#0D1B2A] p-4 text-white">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">
                Equivalente en Pesos
              </p>
              <p className="mt-1 text-2xl font-bold text-[#D99A55]">
                $ {formatNumber(clpTotal)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Neto <-> IVA 19% */}
        <Card>
          <CardHeader>
            <CardTitle>Calculadora IVA (19 %)</CardTitle>
            <CardDescription>
              Desglose inmediato desde monto neto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="net-val">Monto Neto (CLP)</Label>
              <Input
                id="net-val"
                type="number"
                min={0}
                step={10000}
                value={netAmount}
                onChange={(e) => setNetAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">IVA (19 %)</span>
                <span className="font-semibold text-[#0D1B2A]">
                  $ {formatNumber(ivaValue)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-[#0D1B2A]">Total Bruto</span>
                <span className="font-bold text-[#0F7E73]">
                  $ {formatNumber(grossAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Margen vs Markup */}
        <Card>
          <CardHeader>
            <CardTitle>Precio por Margen Objetivo</CardTitle>
            <CardDescription>
              Evite confundir margen sobre venta con recargo sobre costo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="unit-cost">Costo directo (CLP)</Label>
              <Input
                id="unit-cost"
                type="number"
                min={0}
                step={10000}
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target-margin">Margen objetivo (%)</Label>
              <Input
                id="target-margin"
                type="number"
                min={0}
                max={95}
                step={1}
                value={targetMarginPct}
                onChange={(e) =>
                  setTargetMarginPct(Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2 rounded-lg border border-[#D99A55]/35 bg-[#FDF6EC] p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-700">Precio neto sugerido</span>
                <span className="font-bold text-[#0D1B2A]">
                  $ {formatNumber(sellingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Recargo equivalente (Markup)</span>
                <span className="font-semibold text-[#B97A35]">
                  +{formatNumber(markupPct, 1)} %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
