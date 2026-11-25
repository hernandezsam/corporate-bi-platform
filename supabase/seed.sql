-- ==============================================================================
-- DATOS INICIALES (CATEGORÍAS E INFORMES DE DEMOSTRACIÓN)
-- ==============================================================================
-- Ejecutar DESPUÉS de supabase/schema.sql.
-- NOTA DE SEGURIDAD:
-- Las URLs de Power BI incluidas aquí son marcadores de posición.
-- Reemplácelas desde el Panel de Administración (/admin/informes) con URLs
-- seguras de inserción corporativa (nunca utilice "Publish to web" para datos
-- confidenciales de la empresa).

-- 1. Categorías iniciales
INSERT INTO public.categories (name, description, icon, sort_order, active)
VALUES
  ('Finanzas', 'Estados financieros, flujo bancario, tesorería y control presupuestario.', 'Landmark', 1, true),
  ('Operaciones y Proyectos', 'Seguimiento de obra, avance físico-financiero, costos y hitos.', 'Briefcase', 2, true),
  ('Personas y HH', 'Dotación, distribución de horas hombre, ausentismo y desempeño.', 'Users', 3, true),
  ('Comercial', 'Pipeline comercial, licitaciones, cartera de clientes y facturación.', 'TrendingUp', 4, true)
ON CONFLICT (name) DO NOTHING;

-- 2. Informes de demostración
INSERT INTO public.reports (name, description, powerbi_url, category_id, icon, active, sort_order)
SELECT
  v.name,
  v.description,
  v.powerbi_url,
  c.id,
  v.icon,
  true,
  v.sort_order
FROM (
  VALUES
    (
      'Estado de Resultados',
      'Consolidado mensual y acumulado de ingresos, costos operacionales, margen bruto y EBITDA.',
      'https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000001&autoAuth=true',
      'Finanzas',
      'FileSpreadsheet',
      1
    ),
    (
      'Flujo Bancario',
      'Posición diaria de caja, proyecciones de ingresos/egresos y saldos por entidad financiera.',
      'https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000002&autoAuth=true',
      'Finanzas',
      'Wallet',
      2
    ),
    (
      'Control Presupuestario',
      'Comparativo de presupuesto aprobado versus ejecución real y desviaciones por centro de costo.',
      'https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000003&autoAuth=true',
      'Finanzas',
      'PieChart',
      3
    ),
    (
      'Control de Proyectos',
      'Curvas S de avance, estado de entregables, desviación de plazos e indicadores de rentabilidad.',
      'https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000004&autoAuth=true',
      'Operaciones y Proyectos',
      'FolderKanban',
      4
    ),
    (
      'Recursos Humanos',
      'Indicadores de dotación, rotación, licencias, capacitaciones y estructura organizacional.',
      'https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000005&autoAuth=true',
      'Personas y HH',
      'UserCheck',
      5
    ),
    (
      'Distribución de HH',
      'Imputación de horas hombre por proyecto, especialidad, cliente y tasa de utilización.',
      'https://app.powerbi.com/reportEmbed?reportId=00000000-0000-0000-0000-000000000006&autoAuth=true',
      'Personas y HH',
      'Clock',
      6
    )
) AS v(name, description, powerbi_url, cat_name, icon, sort_order)
JOIN public.categories c ON c.name = v.cat_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.reports r WHERE r.name = v.name
);
