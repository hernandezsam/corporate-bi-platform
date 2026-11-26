-- ==============================================================================
-- SECURITY HARDENING (UP) — Tabla inmutable de auditoría administrativa
-- ==============================================================================
-- Opcional y 100% reversible con 20261126_security_hardening_down.sql.
-- Aplicar en Supabase SQL Editor o vía MCP cuando desee activar auditoría.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'report', 'category', 'assignment')),
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo administradores activos pueden consultar la bitácora.
-- No se definen políticas de INSERT/UPDATE/DELETE para usuarios de cliente:
-- solo el servidor con service_role inserta eventos, garantizando inmutabilidad.
DROP POLICY IF EXISTS "audit_logs_select_admin_only" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin_only"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (private.is_admin());
