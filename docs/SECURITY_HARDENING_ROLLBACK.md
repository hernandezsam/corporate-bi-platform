# Guía de Aplicación y Reversión — Endurecimiento de Seguridad (OWASP Top 10)

Este documento describe qué controles de seguridad fueron implementados, cómo aplicarlos en producción (Render + Supabase) y **cómo revertirlos en 1 solo comando** si fuera necesario.

---

## 1. Cambios incluidos en este paquete (commit atómico)

| Control | Archivo(s) | Impacto / Flexibilidad |
|---|---|---|
| **Content-Security-Policy (CSP)** | `next.config.ts` | Restringe `frame-src` a `*.powerbi.com`, `*.analysis.windows.net` y `*.fabric.microsoft.com`, y bloquea clickjacking (`frame-ancestors 'self'`). Permite dominios extra sin tocar código mediante `NEXT_PUBLIC_EXTRA_FRAME_HOSTS`. |
| **Allowlist de URLs Power BI + cotas Zod** | `src/lib/security.ts`, `src/lib/validators.ts`, `src/services/powerbi.service.ts` | Exige `https://` y dominio autorizado Power BI / Fabric (ampliable con `ALLOWED_EMBED_HOSTS`). Limita arreglos `report_ids` a máximo 200 elementos. |
| **Protección Open Redirect (`/\`) y CSRF (`Origin`)** | `src/lib/security.ts`, `src/lib/auth.ts`, `src/app/intranet/auth/callback/route.ts`, `/api/admin/*`, `/api/profile` | Bloquea rutas externas con `//` o `/\`. Valida que las mutaciones autenticadas por cookie provengan del mismo `Host`. |
| **Anti-spam en `/api/contact`** | `src/app/api/contact/route.ts`, `src/components/public/contact-form.tsx` | Rate limiting por IP (5 envíos / 10 min, HTTP 429) + campo honeypot oculto (`website`). |
| **Mínimo privilegio en payload RSC y `/api/health`** | `src/app/intranet/(protected)/layout.tsx`, `src/app/api/health/route.ts` | El sidebar ya no serializa `powerbi_url` en el layout global. `/api/health` responde solo `{ "status": "ok" }`. |
| **Bitácora administrativa (`audit_logs`)** | `src/lib/audit.ts`, `supabase/migrations/20261126_security_hardening_up.sql` | No bloqueante: si la tabla aún no existe o se revierte, el sistema sigue funcionando sin errores. |

---

## 2. Cómo APLICAR en producción

### A. Código (GitHub → Render)
```powershell
cd C:\Users\samue\.gemini\antigravity\scratch\corporate-bi-platform
git push origin main
```

### B. Base de datos (Opcional — Bitácora `audit_logs`)
Ejecute [`supabase/migrations/20261126_security_hardening_up.sql`](../supabase/migrations/20261126_security_hardening_up.sql) en el **SQL Editor** de Supabase.

### C. Supabase Auth (Recomendado — 10 segundos en Dashboard)
1. **Authentication → Password Security:** activar **Leaked Password Protection (HaveIBeenPwned)**.
2. **Authentication → Providers → Email:** confirmar **"Allow new users to sign up" = OFF**.
3. **Authentication → Settings:** ajustar **JWT expiry** a `1800` segundos (30 min).

---

## 3. Cómo REVERTIR si surge algún problema

### A. Revertir TODO el endurecimiento de código (1 comando seguro)
Se creó el tag `pre-security-hardening` justo antes del commit de seguridad (`aace6c2`). Para revertir limpiamente creando un commit inverso (recomendado para producción sin reescribir historial):

```powershell
cd C:\Users\samue\.gemini\antigravity\scratch\corporate-bi-platform
git revert HEAD --no-edit
git push origin main
```

*(Si prefieres volver exactamente al punto previo local antes de hacer push: `git reset --hard pre-security-hardening`.)*

### B. Relajar solo la lista de dominios embebidos SIN revertir código
Si necesitas incrustar un informe desde otro dominio HTTPS distinto a `*.powerbi.com`, solo agrega en Render (Environment Variables):
```env
NEXT_PUBLIC_EXTRA_FRAME_HOSTS=app.otro-bi.com
ALLOWED_EMBED_HOSTS=app.otro-bi.com
```

### C. Revertir la tabla `audit_logs` en Supabase (si la aplicaste)
Ejecute [`supabase/migrations/20261126_security_hardening_down.sql`](../supabase/migrations/20261126_security_hardening_down.sql) en el **SQL Editor** de Supabase.
