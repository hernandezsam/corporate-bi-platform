# Guía de Despliegue en Producción — Render.com + Supabase

Esta guía detalla paso a paso cómo conectar Supabase, configurar el servicio Web Service en Render.com, habilitar dominio personalizado con HTTPS y crear el administrador principal de forma segura.

---

## 1. Configuración de Supabase

1. Cree un proyecto en [supabase.com](https://supabase.com).
2. Vaya a **SQL Editor** y ejecute completamente el archivo [`supabase/schema.sql`](../supabase/schema.sql).
   - Esto crea las tablas `categories`, `profiles`, `reports`, `user_reports`, `contact_messages`, índices, funciones `SECURITY DEFINER`, triggers de integridad y todas las políticas **Row Level Security (RLS)**.
3. (Opcional) Ejecute [`supabase/seed.sql`](../supabase/seed.sql) para cargar categorías e informes de demostración.
4. En **Authentication > Providers > Email**:
   - Mantenga habilitado el proveedor Email.
   - **Deshabilite el registro público ("Allow new users to sign up" = OFF)** para que las cuentas solo puedan ser creadas desde el panel administrativo mediante `SUPABASE_SERVICE_ROLE_KEY`.
5. En **Authentication > URL Configuration**:
   - **Site URL**: `https://tu-dominio-corporativo.com` (o la URL `.onrender.com` inicialmente).
   - **Redirect URLs**: agregue:
     - `https://tu-dominio-corporativo.com/intranet/auth/callback`
     - `http://localhost:3000/intranet/auth/callback` (para desarrollo local).
6. Obtenga las credenciales en **Project Settings > API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role / secret` → `SUPABASE_SERVICE_ROLE_KEY` (**mantener estrictamente privada en servidor**).

---

## 2. Despliegue en Render.com

### Opción A: Usando `render.yaml` (Blueprint)
1. Suba el proyecto a su repositorio privado en GitHub o GitLab.
2. En el panel de Render.com seleccione **New > Blueprint** y elija su repositorio.
3. Render detectará automáticamente [`render.yaml`](../render.yaml).
4. Complete las variables de entorno marcadas como `sync: false`.

### Opción B: Creación manual de Web Service
1. En Render.com haga clic en **New > Web Service**.
2. Conecte su repositorio y configure:
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
3. Configure las **Environment Variables**:

| Variable | Tipo | Descripción |
|---|---|---|
| `NODE_VERSION` | Pública/Build | `20.18.0` (recomendado >= 20) |
| `NODE_ENV` | Servidor | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Clave pública anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Privada (Solo Servidor)** | Clave administrativa (nunca exponer al cliente) |
| `NEXT_PUBLIC_SITE_URL` | Pública | URL final de producción (`https://tu-dominio.com`) |
| `NEXT_PUBLIC_COMPANY_NAME` | Pública (Opcional) | Nombre de la empresa |
| `NEXT_PUBLIC_COMPANY_TAGLINE` | Pública (Opcional) | Bajada o eslogan corporativo |

4. Haga clic en **Create Web Service** y verifique que el endpoint `/api/health` responda HTTP 200 con `"supabaseConfigured": true`.

---

## 3. Creación del Administrador Principal (Sin credenciales hardcodeadas)

Una vez desplegado (o en local con `.env.local` configurado), ejecute el script seguro de creación del primer administrador:

### En local o desde Render Shell:
```bash
ADMIN_EMAIL="admin@tuempresa.com" \
ADMIN_FULL_NAME="Administrador Principal" \
ADMIN_PASSWORD="CambiarEstaPasswordSegura#2026" \
npm run seed:admin
```

O en modo interactivo (sin dejar la contraseña en el historial de comandos):
```bash
npm run seed:admin
```

### Alternativa desde Supabase Dashboard:
1. En **Authentication > Users**, cree el primer usuario con "Auto Confirm User".
2. En **SQL Editor**, promuévalo a administrador:
   ```sql
   UPDATE public.profiles
   SET role = 'ADMIN', active = true
   WHERE email = 'admin@tuempresa.com';
   ```

---

## 4. Configuración de Dominio Personalizado y HTTPS

1. En Render.com, abra su Web Service y vaya a **Settings > Custom Domains**.
2. Haga clic en **Add Custom Domain** e ingrese `tu-dominio.com` y/o `www.tu-dominio.com` (o `intranet.tu-dominio.com`).
3. En su proveedor DNS (Cloudflare, Route53, GoDaddy, NIC, etc.) agregue el registro indicado por Render:
   - Para subdominio (`www` o `intranet`): registro **CNAME** apuntando a `<tu-servicio>.onrender.com`.
   - Para dominio raíz (`@`): registro **ALIAS / ANAME** o registro **A** según las instrucciones de Render.
4. Haga clic en **Verify** en Render.
5. **HTTPS / TLS**: Render emite y renueva automáticamente certificados SSL/TLS (Let's Encrypt) y redirige todo el tráfico HTTP hacia HTTPS. La aplicación además envía la cabecera `Strict-Transport-Security` (HSTS).
6. Actualice `NEXT_PUBLIC_SITE_URL` en Render y las **Site URL / Redirect URLs** en Supabase con el dominio personalizado final.

---

## 5. Consideraciones Críticas de Seguridad para Power BI

> **IMPORTANTE:** Esta intranet controla quién puede visualizar cada informe dentro de la plataforma (autenticación obligatoria, validación en servidor y políticas RLS en PostgreSQL). Sin embargo, **controlar el acceso en la intranet NO protege automáticamente el contenido subyacente del enlace de Power BI si el enlace de origen es público**.

### Buenas prácticas obligatorias:
1. **NO utilizar "Publicar en la web" (`Publish to web` / URLs `/view`)** para información financiera, presupuestaria, de RRHH o confidencial. Cualquier enlace generado con "Publish to web" es accesible públicamente por cualquiera que obtenga la URL.
2. **Modalidad recomendada en V1 (Inserción Segura / Website or Portal)**:
   - Utilice **Archivo > Insertar informe > Sitio web o portal** (`https://app.powerbi.com/reportEmbed?reportId=...&autoAuth=true`).
   - Esta modalidad exige que el usuario se autentique en Microsoft Entra ID (cuenta corporativa con licencia Power BI Pro / Premium Per User o capacidad Premium/Fabric).
3. **Evolución planificada a V2 (Power BI Embedded + Microsoft Entra ID)**:
   - La base de datos (`reports.embed_mode`, `powerbi_workspace_id`, `powerbi_report_id`) y el servicio `src/services/powerbi.service.ts` ya están preparados para integrar generación server-side de *Embed Tokens* mediante Service Principal de Microsoft Entra ID (escenario *App Owns Data*) sin reescribir la intranet ni los permisos.
