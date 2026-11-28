-- ==============================================================================
-- MOTOR UNIVERSAL DE MÓDULOS CORPORATIVOS (UP) — Migración Aditiva y Reversible
-- ==============================================================================
-- Conserva intactas public.reports y public.user_reports para compatibilidad
-- total y rollback seguro con 20261128_universal_modules_down.sql.

-- ==============================================================================
-- 1. TABLAS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'General',
  module_type TEXT NOT NULL CHECK (module_type IN ('POWERBI', 'APP', 'HTML', 'PDF', 'TOOL')),
  render_mode TEXT NOT NULL CHECK (render_mode IN ('POWERBI_IFRAME', 'INTERNAL_COMPONENT', 'EXTERNAL_IFRAME', 'PDF_VIEWER')),
  source_url TEXT,
  icon TEXT NOT NULL DEFAULT 'LayoutGrid',
  thumbnail_url TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_modules_user_id_module_id_unique UNIQUE (user_id, module_id)
);

-- ==============================================================================
-- 2. ÍNDICES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_modules_active_sort ON public.modules(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_modules_category_id ON public.modules(category_id);
CREATE INDEX IF NOT EXISTS idx_modules_type ON public.modules(module_type);
CREATE INDEX IF NOT EXISTS idx_user_modules_user_id ON public.user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_module_id ON public.user_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_assigned_by ON public.user_modules(assigned_by);

-- ==============================================================================
-- 3. FUNCIONES Y TRIGGERS (search_path fijo = '')
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.sync_module_category_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  cat_name TEXT;
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    SELECT name INTO cat_name FROM public.categories WHERE id = NEW.category_id;
    IF cat_name IS NOT NULL THEN
      NEW.category = cat_name;
    END IF;
  ELSIF NEW.category IS NULL OR trim(NEW.category) = '' THEN
    NEW.category = 'General';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.propagate_category_rename()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.reports
    SET category = NEW.name, updated_at = now()
    WHERE category_id = NEW.id;

    UPDATE public.modules
    SET category = NEW.name, updated_at = now()
    WHERE category_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_user_module_tamper()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND NOT private.is_admin() THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.module_id IS DISTINCT FROM OLD.module_id
       OR NEW.assigned_by IS DISTINCT FROM OLD.assigned_by
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'No autorizado: solo puede actualizar el estado de favorito en sus módulos asignados.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_user_module_tamper() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_modules_sync_category
  BEFORE INSERT OR UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.sync_module_category_name();

CREATE TRIGGER trg_user_modules_prevent_tamper
  BEFORE UPDATE ON public.user_modules
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_module_tamper();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

-- modules
CREATE POLICY "modules_select_assigned_or_admin"
  ON public.modules
  FOR SELECT
  TO authenticated
  USING (
    private.is_admin()
    OR (
      private.is_active_user()
      AND active = true
      AND EXISTS (
        SELECT 1
        FROM public.user_modules um
        WHERE um.module_id = modules.id
          AND um.user_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "modules_insert_admin_only"
  ON public.modules
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "modules_update_admin_only"
  ON public.modules
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "modules_delete_admin_only"
  ON public.modules
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- user_modules
CREATE POLICY "user_modules_select_own_or_admin"
  ON public.user_modules
  FOR SELECT
  TO authenticated
  USING (
    private.is_admin()
    OR (private.is_active_user() AND user_id = (SELECT auth.uid()))
  );

CREATE POLICY "user_modules_insert_admin_only"
  ON public.user_modules
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "user_modules_update_own_favorite_or_admin"
  ON public.user_modules
  FOR UPDATE
  TO authenticated
  USING (
    private.is_admin()
    OR (private.is_active_user() AND user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    private.is_admin()
    OR (private.is_active_user() AND user_id = (SELECT auth.uid()))
  );

CREATE POLICY "user_modules_delete_admin_only"
  ON public.user_modules
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- ==============================================================================
-- 5. MIGRACIÓN IDEMPOTENTE DE DATOS EXISTENTES (reports -> modules)
-- ==============================================================================

WITH base_reports AS (
  SELECT
    r.*,
    COALESCE(
      NULLIF(
        trim(
          both '-' FROM regexp_replace(
            lower(
              translate(
                r.name,
                'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
                'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'
              )
            ),
            '[^a-z0-9]+',
            '-',
            'g'
          )
        ),
        ''
      ),
      'modulo'
    ) AS raw_slug,
    row_number() OVER (
      PARTITION BY lower(
        translate(
          r.name,
          'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
          'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'
        )
      )
      ORDER BY r.created_at, r.id
    ) AS slug_seq
  FROM public.reports r
)
INSERT INTO public.modules (
  id,
  name,
  slug,
  description,
  category_id,
  category,
  module_type,
  render_mode,
  source_url,
  icon,
  config,
  sort_order,
  active,
  created_at,
  updated_at
)
SELECT
  b.id,
  b.name,
  CASE
    WHEN b.slug_seq = 1 THEN left(b.raw_slug, 76)
    ELSE left(b.raw_slug, 70) || '-' || b.slug_seq::text
  END AS slug,
  b.description,
  b.category_id,
  b.category,
  'POWERBI',
  'POWERBI_IFRAME',
  b.powerbi_url,
  b.icon,
  jsonb_strip_nulls(
    jsonb_build_object(
      'embed_mode', b.embed_mode,
      'powerbi_workspace_id', b.powerbi_workspace_id,
      'powerbi_report_id', b.powerbi_report_id
    )
  ),
  b.sort_order,
  b.active,
  b.created_at,
  b.updated_at
FROM base_reports b
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_modules (user_id, module_id, assigned_by, is_favorite, created_at)
SELECT
  ur.user_id,
  ur.report_id,
  ur.assigned_by,
  false,
  ur.assigned_at
FROM public.user_reports ur
INNER JOIN public.modules m ON m.id = ur.report_id
ON CONFLICT (user_id, module_id) DO NOTHING;

-- ==============================================================================
-- 6. MÓDULOS NATIVOS DEMO FUNCIONALES (APP y TOOL)
-- ==============================================================================

INSERT INTO public.modules (
  name,
  slug,
  description,
  category_id,
  category,
  module_type,
  render_mode,
  source_url,
  icon,
  config,
  sort_order,
  active
)
SELECT
  'Simulador de Margen y Punto de Equilibrio',
  'simulador-margen',
  'Aplicación interactiva para proyectar ventas, margen de contribución, EBITDA y punto de equilibrio por unidad y facturación.',
  (SELECT id FROM public.categories WHERE lower(name) = 'finanzas' LIMIT 1),
  COALESCE((SELECT name FROM public.categories WHERE lower(name) = 'finanzas' LIMIT 1), 'Finanzas'),
  'APP',
  'INTERNAL_COMPONENT',
  NULL,
  'Calculator',
  '{"app_key": "margin-simulator"}'::jsonb,
  10,
  true
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.modules (
  name,
  slug,
  description,
  category_id,
  category,
  module_type,
  render_mode,
  source_url,
  icon,
  config,
  sort_order,
  active
)
SELECT
  'Calculadora Financiera UF / IVA',
  'calculadora-uf-iva',
  'Herramienta corporativa de cálculo rápido para conversión UF a CLP, desglose de IVA 19% (neto/bruto) y margen comercial.',
  (SELECT id FROM public.categories WHERE lower(name) = 'finanzas' LIMIT 1),
  COALESCE((SELECT name FROM public.categories WHERE lower(name) = 'finanzas' LIMIT 1), 'Finanzas'),
  'TOOL',
  'INTERNAL_COMPONENT',
  NULL,
  'Wrench',
  '{"app_key": "uf-iva-tool"}'::jsonb,
  11,
  true
ON CONFLICT (slug) DO NOTHING;

-- Asignar los 2 módulos nativos demo a los administradores activos existentes
INSERT INTO public.user_modules (user_id, module_id, assigned_by, is_favorite)
SELECT
  p.id,
  m.id,
  p.id,
  false
FROM public.profiles p
CROSS JOIN public.modules m
WHERE p.role = 'ADMIN'
  AND p.active = true
  AND m.slug IN ('simulador-margen', 'calculadora-uf-iva')
ON CONFLICT (user_id, module_id) DO NOTHING;
