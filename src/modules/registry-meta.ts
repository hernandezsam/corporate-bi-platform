import type { RegisteredAppMeta } from "@/types/modules";

/**
 * Metadatos seguros de servidor para aplicaciones nativas registradas.
 * Al agregar una nueva aplicación React independiente en src/modules/applications/,
 * regístrela aquí y en src/modules/registry.ts.
 */
export const REGISTERED_APPS_META: RegisteredAppMeta[] = [
  {
    key: "margin-simulator",
    label: "Simulador de Margen y Punto de Equilibrio",
    description:
      "Aplicación interactiva para simular escenarios de ingresos, costos directos, gastos fijos y punto de equilibrio por proyecto.",
    moduleType: "APP",
    defaultIcon: "TrendingUp",
    defaultCategory: "Finanzas",
    version: "1.0.0",
  },
  {
    key: "uf-iva-tool",
    label: "Calculadora Financiera (UF / IVA / Margen)",
    description:
      "Herramienta rápida de conversión UF ↔ CLP, cálculo neto/bruto con IVA 19 % y comparativo de margen sobre venta versus markup.",
    moduleType: "TOOL",
    defaultIcon: "Activity",
    defaultCategory: "Finanzas",
    version: "1.0.0",
  },
];

export const REGISTERED_APP_KEYS = new Set(
  REGISTERED_APPS_META.map((item) => item.key)
);

export function getRegisteredAppMeta(
  key: string | null | undefined
): RegisteredAppMeta | undefined {
  if (!key) return undefined;
  return REGISTERED_APPS_META.find((item) => item.key === key);
}
