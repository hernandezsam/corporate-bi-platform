# Plataforma Corporativa e Intranet Privada de Informes Power BI

Plataforma web empresarial lista para producción compuesta por:

1. **Sitio web corporativo público** (responsive, identidad configurable mediante placeholders en un único archivo).
2. **Intranet privada de informes Power BI** con autenticación obligatoria mediante Supabase Auth y visualización embebida responsiva.
3. **Panel de administración completo** (protegido en frontend, middleware, API server y PostgreSQL RLS) para gestionar usuarios, informes, categorías y asignaciones granulares usuario ↔ informe.

---

## Stack Tecnológico

- **Frontend / Full Stack**: Next.js 15 (App Router), React 19, TypeScript
- **Estilos y UI**: Tailwind CSS, componentes modulares estilo shadcn/ui (Radix UI), Lucide Icons
- **Backend y Base de Datos**: Supabase (PostgreSQL + Supabase Auth + Row Level Security)
- **Validación**: Zod (cliente y servidor)
- **Despliegue**: Render.com (`render.yaml`, healthcheck `/api/health`)

---

## Arquitectura y Flujo de Conexión

```
Navegador (Sitio Público / Intranet / Admin)
   │
   ├── Rutas públicas (/, /nosotros, /servicios, /proyectos, /contacto)
   │     └── /api/contact ──► Supabase (contact_messages)
   │
   ├── Middleware Next.js (src/middleware.ts)
   │     └── Verifica sesión JWT contra Supabase Auth + profiles.active + profiles.role
   │
   ├── Intranet (/intranet/dashboard, /intranet/reportes/[id], /intranet/perfil)
   │     └── Server Components + Supabase Server Client (Anon Key + Cookies de sesión)
   │           └── PostgreSQL RLS filtra automáticamente solo informes activos asignados
   │
   └── Panel Admin (/admin/*)
         ├── Server Components protegidos por requireAdminUser()
         └── Route Handlers (/api/admin/*) protegidos por verifyAdminApiRequest()
               ├── Gestión de usuarios ──► Supabase Admin Client (SUPABASE_SERVICE_ROLE_KEY solo en servidor)
               └── Informes, Categorías y Asignaciones ──► PostgreSQL con RLS ADMIN
```

---

## Estructura de Carpetas

```text
corporate-bi-platform/
├── docs/
│   └── DEPLOYMENT_RENDER.md      # Guía detallada de Render, Supabase, HTTPS y Power BI
├── scripts/
│   ├── create-admin.mjs          # Bootstrap seguro del primer usuario ADMIN
│   └── seed-demo.mjs             # Carga inicial de categorías e informes demo
├── supabase/
│   ├── schema.sql                # Tablas, FKs, índices, triggers, funciones y RLS completo
│   └── seed.sql                  # Categorías e informes de demostración
├── src/
│   ├── app/
│   │   ├── (public)/             # Sitio corporativo público (/, /nosotros, /servicios, /proyectos, /contacto)
│   │   ├── intranet/             # /intranet, /intranet/login, /intranet/reset-password, /intranet/auth/callback
│   │   │   └── (protected)/      # /intranet/dashboard, /intranet/reportes/[id], /intranet/perfil
│   │   ├── admin/                # /admin, /usuarios, /usuarios/[id], /informes, /informes/[id], /categorias, /asignaciones
│   │   └── api/                  # /api/health, /api/contact, /api/profile, /api/auth/logout, /api/admin/*
│   ├── components/
│   │   ├── ui/                   # Primitivas reutilizables shadcn/ui
│   │   ├── shared/               # BrandLogo y utilidades compartidas
│   │   ├── public/               # Navbar, Footer, ContactForm, ProjectsGallery
│   │   ├── intranet/             # LoginForm, IntranetShell, DashboardWorkspace, PowerBiViewer, ProfileForm
│   │   └── admin/                # AdminShell, UsersManager, UserDetailEditor, ReportsManager, ReportDetailEditor, CategoriesManager, AssignmentsManager
│   ├── config/
│   │   └── site.ts               # Placeholders corporativos centralizados (nombre, textos, servicios, proyectos, contacto)
│   ├── hooks/                    # Hooks reutilizables
│   ├── lib/
│   │   ├── supabase/             # client.ts (browser), server.ts (RSC/API), admin.ts (service_role), middleware.ts
│   │   ├── auth.ts               # Guards de servidor (requireActiveUser, requireAdminUser, verifyAdminApiRequest)
│   │   ├── icons.ts              # Mapa de iconos Lucide
│   │   ├── validators.ts         # Esquemas Zod
│   │   └── utils.ts              # Formateadores y helpers
│   ├── services/
│   │   └── powerbi.service.ts    # Abstracción lista para futura integración Power BI Embedded + Microsoft Entra ID
│   └── types/
│       └── database.ts           # Tipos TypeScript de PostgreSQL
├── .env.example
├── render.yaml
└── next.config.ts                # Cabeceras de seguridad HTTP
```

---

## Instalación y Puesta en Marcha Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env.local
   ```
   Complete `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.

3. **Inicializar la base de datos en Supabase**:
   - Ejecute [`supabase/schema.sql`](supabase/schema.sql) en el **SQL Editor** de Supabase.
   - Opcionalmente ejecute [`supabase/seed.sql`](supabase/seed.sql) o `npm run seed:demo`.

4. **Crear el primer usuario administrador**:
   ```bash
   npm run seed:admin
   ```

5. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

6. **Validar compilación de producción**:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```

---

## Personalización de Identidad Corporativa

Modifique [`src/config/site.ts`](src/config/site.ts) para actualizar:
- Nombre de la empresa y tagline (o mediante `NEXT_PUBLIC_COMPANY_NAME` / `NEXT_PUBLIC_COMPANY_TAGLINE`).
- Descripción corporativa, misión, visión y valores.
- Servicios, proyectos destacados, indicadores y datos de contacto.
- Logotipo en [`src/components/shared/brand-logo.tsx`](src/components/shared/brand-logo.tsx).

---

## Seguridad Implementada

- **Row Level Security (RLS)** en todas las tablas (`profiles`, `reports`, `user_reports`, `categories`, `contact_messages`).
- **Funciones `SECURITY DEFINER`** (`public.is_admin()`, `public.is_active_user()`) que validan rol y vigencia directamente desde PostgreSQL sin recursión y sin confiar en valores del cliente.
- **Trigger anti-escalada de privilegios** (`prevent_profile_privilege_escalation`) que impide que un usuario modifique su propio `role`, `active` o `email`.
- **Bloqueo efectivo de usuarios desactivados**: desactivar un usuario bloquea su cuenta en `profiles.active = false` (RLS devuelve 0 filas), cierra sesión en middleware y aplica `ban_duration` en Supabase Auth.
- **Validación en doble capa en `/intranet/reportes/[id]`**: RLS + verificación explícita en servidor antes de enviar la URL del iframe al navegador.
- **`SUPABASE_SERVICE_ROLE_KEY` estrictamente en servidor**: protegida contra importación en cliente y nunca expuesta con prefijo `NEXT_PUBLIC_`.
- **Advertencia sobre enlaces Power BI**: consulte [`docs/DEPLOYMENT_RENDER.md`](docs/DEPLOYMENT_RENDER.md#5-consideraciones-críticas-de-seguridad-para-power-bi).
