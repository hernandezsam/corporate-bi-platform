#!/usr/bin/env node
/**
 * Script de carga inicial de categorías e informes de demostración en Supabase.
 *
 * Uso:
 *   npm run seed:demo
 *
 * Opcional: asignar automáticamente todos los informes demo a un correo existente:
 *   ASSIGN_TO_EMAIL=usuario@empresa.com npm run seed:demo
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const DEMO_CATEGORIES = [
  {
    name: "Finanzas",
    description:
      "Estados financieros, flujo bancario, tesorería y control presupuestario.",
    icon: "Landmark",
    sort_order: 1,
    active: true,
  },
  {
    name: "Operaciones y Proyectos",
    description:
      "Seguimiento de obra, avance físico-financiero, costos y cumplimiento de hitos.",
    icon: "Briefcase",
    sort_order: 2,
    active: true,
  },
  {
    name: "Personas y HH",
    description:
      "Dotación, distribución de horas hombre, ausentismo y utilización.",
    icon: "Users",
    sort_order: 3,
    active: true,
  },
  {
    name: "Comercial",
    description:
      "Pipeline comercial, licitaciones, cartera de clientes y facturación.",
    icon: "TrendingUp",
    sort_order: 4,
    active: true,
  },
];

const DEMO_REPORTS = [
  {
    name: "Estado de Resultados",
    description:
      "Consolidado mensual y acumulado de ingresos, costos operacionales, margen bruto y EBITDA.",
    powerbi_url:
      "https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000001&autoAuth=true",
    categoryName: "Finanzas",
    icon: "FileSpreadsheet",
    sort_order: 1,
  },
  {
    name: "Flujo Bancario",
    description:
      "Posición diaria de caja, proyecciones de ingresos/egresos y saldos por entidad financiera.",
    powerbi_url:
      "https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000002&autoAuth=true",
    categoryName: "Finanzas",
    icon: "Wallet",
    sort_order: 2,
  },
  {
    name: "Control Presupuestario",
    description:
      "Comparativo de presupuesto aprobado versus ejecución real y desviaciones por centro de costo.",
    powerbi_url:
      "https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000003&autoAuth=true",
    categoryName: "Finanzas",
    icon: "PieChart",
    sort_order: 3,
  },
  {
    name: "Control de Proyectos",
    description:
      "Curvas S de avance, estado de entregables, desviación de plazos e indicadores de rentabilidad.",
    powerbi_url:
      "https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000004&autoAuth=true",
    categoryName: "Operaciones y Proyectos",
    icon: "FolderKanban",
    sort_order: 4,
  },
  {
    name: "Recursos Humanos",
    description:
      "Indicadores de dotación, rotación, licencias y estructura organizacional.",
    powerbi_url:
      "https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000005&autoAuth=true",
    categoryName: "Personas y HH",
    icon: "UserCheck",
    sort_order: 5,
  },
  {
    name: "Distribución de HH",
    description:
      "Imputación de horas hombre por proyecto, especialidad, cliente y tasa de utilización.",
    powerbi_url:
      "https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000006&autoAuth=true",
    categoryName: "Personas y HH",
    icon: "Clock",
    sort_order: 6,
  },
];

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Error: Defina NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Insertando categorías iniciales...");
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(DEMO_CATEGORIES, { onConflict: "name" });

  if (catErr) {
    console.error("Error insertando categorías:", catErr.message);
    process.exit(1);
  }

  const { data: allCats } = await supabase.from("categories").select("id, name");
  const catByName = new Map((allCats ?? []).map((c) => [c.name, c.id]));

  const { data: existingReports } = await supabase
    .from("reports")
    .select("id, name");
  const existingNames = new Set((existingReports ?? []).map((r) => r.name));

  console.log("Insertando informes de demostración...");
  for (const rep of DEMO_REPORTS) {
    if (existingNames.has(rep.name)) continue;
    const { error } = await supabase.from("reports").insert({
      name: rep.name,
      description: rep.description,
      powerbi_url: rep.powerbi_url,
      category_id: catByName.get(rep.categoryName) ?? null,
      category: rep.categoryName,
      icon: rep.icon,
      sort_order: rep.sort_order,
      active: true,
    });
    if (error) {
      console.error(`Error insertando "${rep.name}":`, error.message);
    }
  }

  const assignEmail = process.env.ASSIGN_TO_EMAIL?.trim().toLowerCase();
  if (assignEmail) {
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", assignEmail)
      .maybeSingle();

    if (targetUser) {
      const { data: allReports } = await supabase.from("reports").select("id");
      const rows = (allReports ?? []).map((r) => ({
        user_id: targetUser.id,
        report_id: r.id,
        assigned_by: targetUser.id,
      }));
      if (rows.length > 0) {
        await supabase
          .from("user_reports")
          .upsert(rows, { onConflict: "user_id,report_id" });
        console.log(
          `✔ ${rows.length} informes asignados a ${assignEmail}.`
        );
      }
    } else {
      console.warn(`Aviso: No se encontró un perfil con correo ${assignEmail}.`);
    }
  }

  console.log("✔ Seed de datos iniciales completado.");
  console.log(
    "  Recuerde reemplazar las URLs placeholder desde /admin/informes.\n"
  );
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
