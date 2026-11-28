-- ==============================================================================
-- MOTOR UNIVERSAL DE MÓDULOS CORPORATIVOS (DOWN) — Rollback Limpio
-- ==============================================================================
-- Revierte completamente las tablas modules y user_modules manteniendo intactas
-- las tablas originales reports y user_reports.

DROP TRIGGER IF EXISTS trg_user_modules_prevent_tamper ON public.user_modules;
DROP TRIGGER IF EXISTS trg_modules_sync_category ON public.modules;
DROP TRIGGER IF EXISTS trg_modules_updated_at ON public.modules;

DROP TABLE IF EXISTS public.user_modules;
DROP TABLE IF EXISTS public.modules;

DROP FUNCTION IF EXISTS public.prevent_user_module_tamper();
DROP FUNCTION IF EXISTS public.sync_module_category_name();

-- Restaurar propagate_category_rename solo para reports
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
