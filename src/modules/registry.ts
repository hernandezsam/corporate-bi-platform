"use client";

import dynamic from "next/dynamic";
import { createElement, type ComponentType } from "react";
import type { RegisteredModuleProps } from "@/types/modules";
import { ModuleLoading } from "@/modules/shared/ModuleLoading";

/**
 * Registro estático controlado de aplicaciones y herramientas React nativas.
 *
 * Para registrar una nueva aplicación independiente (ej. Analizador de Cuentas Contables):
 * 1. Cree su carpeta en src/modules/applications/<nombre>/
 * 2. Agregue sus metadatos en src/modules/registry-meta.ts
 * 3. Registre aquí su carga dinámica por app_key.
 *
 * Nunca evalúa rutas ni nombres de archivo dinámicos provenientes del cliente.
 */
const APP_REGISTRY: Record<string, ComponentType<RegisteredModuleProps>> = {
  "margin-simulator": dynamic(
    () =>
      import(
        "@/modules/applications/margin-simulator/MarginSimulatorApp"
      ),
    {
      loading: () =>
        createElement(ModuleLoading, {
          label: "Cargando Simulador de Margen...",
        }),
    }
  ),
  "uf-iva-tool": dynamic(
    () => import("@/modules/applications/uf-iva-tool/FinancialToolsApp"),
    {
      loading: () =>
        createElement(ModuleLoading, {
          label: "Cargando Calculadora Financiera...",
        }),
    }
  ),
};

export function getRegisteredModuleComponent(
  appKey: string | null | undefined
): ComponentType<RegisteredModuleProps> | null {
  if (!appKey) return null;
  return APP_REGISTRY[appKey] ?? null;
}
