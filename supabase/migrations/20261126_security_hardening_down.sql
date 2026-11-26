-- ==============================================================================
-- SECURITY HARDENING (DOWN / ROLLBACK)
-- ==============================================================================
-- Revierte limpiamente 20261126_security_hardening_up.sql sin afectar usuarios,
-- informes, categorías ni asignaciones.

DROP POLICY IF EXISTS "audit_logs_select_admin_only" ON public.audit_logs;
DROP TABLE IF EXISTS public.audit_logs;
