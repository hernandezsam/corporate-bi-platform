-- ==============================================================================
-- PLATAFORMA CORPORATIVA E INTRANET POWER BI — ESQUEMA POSTGRESQL + RLS
-- ==============================================================================
-- Compatible con Supabase Security & Performance Advisors (sin search_path
-- mutables, funciones SECURITY DEFINER aisladas en esquema privado y
-- expresiones (select auth.uid()) optimizadas).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Esquema privado no expuesto por la Data API para helpers SECURITY DEFINER
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

-- ==============================================================================
-- 1. TABLAS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Folder',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  powerbi_url TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'General',
  icon TEXT NOT NULL DEFAULT 'BarChart3',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Preparado para futura integración con Power BI Embedded + Microsoft Entra ID
  embed_mode TEXT NOT NULL DEFAULT 'direct_url' CHECK (embed_mode IN ('direct_url', 'powerbi_embedded')),
  powerbi_workspace_id TEXT,
  powerbi_report_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT user_reports_user_id_report_id_unique UNIQUE (user_id, report_id)
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 2. ÍNDICES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON public.profiles(role, active);
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON public.categories(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_reports_active_sort ON public.reports(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON public.reports(category_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON public.user_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_report_id ON public.user_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_assigned_by ON public.user_reports(assigned_by);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- ==============================================================================
-- 3. FUNCIONES DE SEGURIDAD Y UTILIDAD (search_path fijo = '')
-- ==============================================================================

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'ADMIN'
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION private.is_active_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND active = true
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION private.is_active_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_active_user() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND NOT private.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'No autorizado: los usuarios no pueden modificar su propio rol.';
    END IF;
    IF NEW.active IS DISTINCT FROM OLD.active THEN
      RAISE EXCEPTION 'No autorizado: los usuarios no pueden modificar su propio estado.';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'No autorizado: el correo electrónico debe ser modificado por un administrador.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_report_category_name()
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
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, active)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), split_part(NEW.email, '@', 1)),
    LOWER(NEW.email),
    'USER',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ==============================================================================
-- 4. TRIGGERS
-- ==============================================================================

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_prevent_escalation ON public.profiles;
CREATE TRIGGER trg_profiles_prevent_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_reports_sync_category ON public.reports;
CREATE TRIGGER trg_reports_sync_category
  BEFORE INSERT OR UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.sync_report_category_name();

DROP TRIGGER IF EXISTS trg_categories_propagate_rename ON public.categories;
CREATE TRIGGER trg_categories_propagate_rename
  AFTER UPDATE OF name ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.propagate_category_rename();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "profiles_insert_admin_only" ON public.profiles;
CREATE POLICY "profiles_insert_admin_only"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_active_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_active_or_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    private.is_admin()
    OR ((SELECT auth.uid()) = id AND private.is_active_user())
  )
  WITH CHECK (
    private.is_admin()
    OR ((SELECT auth.uid()) = id AND private.is_active_user())
  );

DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
CREATE POLICY "profiles_delete_admin_only"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- categories
DROP POLICY IF EXISTS "categories_select_active_or_admin" ON public.categories;
CREATE POLICY "categories_select_active_or_admin"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (
    private.is_admin()
    OR (private.is_active_user() AND active = true)
  );

DROP POLICY IF EXISTS "categories_insert_admin_only" ON public.categories;
CREATE POLICY "categories_insert_admin_only"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "categories_update_admin_only" ON public.categories;
CREATE POLICY "categories_update_admin_only"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin_only" ON public.categories;
CREATE POLICY "categories_delete_admin_only"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- reports
DROP POLICY IF EXISTS "reports_select_assigned_or_admin" ON public.reports;
CREATE POLICY "reports_select_assigned_or_admin"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (
    private.is_admin()
    OR (
      private.is_active_user()
      AND active = true
      AND EXISTS (
        SELECT 1
        FROM public.user_reports ur
        WHERE ur.report_id = reports.id
          AND ur.user_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "reports_insert_admin_only" ON public.reports;
CREATE POLICY "reports_insert_admin_only"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "reports_update_admin_only" ON public.reports;
CREATE POLICY "reports_update_admin_only"
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "reports_delete_admin_only" ON public.reports;
CREATE POLICY "reports_delete_admin_only"
  ON public.reports
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- user_reports
DROP POLICY IF EXISTS "user_reports_select_own_or_admin" ON public.user_reports;
CREATE POLICY "user_reports_select_own_or_admin"
  ON public.user_reports
  FOR SELECT
  TO authenticated
  USING (
    private.is_admin()
    OR (private.is_active_user() AND user_id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "user_reports_insert_admin_only" ON public.user_reports;
CREATE POLICY "user_reports_insert_admin_only"
  ON public.user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "user_reports_update_admin_only" ON public.user_reports;
CREATE POLICY "user_reports_update_admin_only"
  ON public.user_reports
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "user_reports_delete_admin_only" ON public.user_reports;
CREATE POLICY "user_reports_delete_admin_only"
  ON public.user_reports
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- contact_messages (solo inserción pública con campos no vacíos; lectura/borrado solo ADMIN)
DROP POLICY IF EXISTS "contact_messages_insert_public" ON public.contact_messages;
CREATE POLICY "contact_messages_insert_public"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) >= 2
    AND length(trim(email)) >= 5
    AND length(trim(subject)) >= 3
    AND length(trim(message)) >= 10
  );

DROP POLICY IF EXISTS "contact_messages_select_admin_only" ON public.contact_messages;
CREATE POLICY "contact_messages_select_admin_only"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

DROP POLICY IF EXISTS "contact_messages_delete_admin_only" ON public.contact_messages;
CREATE POLICY "contact_messages_delete_admin_only"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (private.is_admin());
