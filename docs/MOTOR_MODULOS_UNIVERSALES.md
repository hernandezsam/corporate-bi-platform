# Motor Universal de Módulos Corporativos — Findex

Guía técnica y operativa para incorporar, administrar y mantener módulos independientes dentro de la intranet de **Findex**.

---

## 1. Arquitectura General

La intranet de Findex actúa como **contenedor y administrador corporativo** (autenticación Supabase SSR, navegación, permisos RLS, favoritos y visor unificado), mientras cada módulo se desarrolla de forma desacoplada.

### Tipos de módulos soportados

| Tipo (`module_type`) | Modo de renderizado (`render_mode`) | Visor | Uso principal |
| :--- | :--- | :--- | :--- |
| `POWERBI` | `POWERBI_IFRAME` | `PowerBIViewer` | Informes Power BI embebidos con validación HTTPS y allowlist |
| `APP` | `INTERNAL_COMPONENT` | Registro controlado (`src/modules/registry.ts`) | Aplicaciones React/TypeScript independientes (simuladores, analizadores) |
| `TOOL` | `INTERNAL_COMPONENT` | Registro controlado (`src/modules/registry.ts`) | Utilidades corporativas rápidas (calculadoras UF/IVA, conversores) |
| `HTML` | `EXTERNAL_IFRAME` | `HTMLViewer` | Dashboards HTML/CSS/JS alojados externamente con `iframe sandbox` estricto |
| `PDF` | `PDF_VIEWER` | `PDFViewer` | Documentos PDF corporativos con descarga controlada |

### Estructura de carpetas

```text
src/
  types/modules.ts                # Tipos, etiquetas y render modes
  services/
    modules.service.ts            # Consultas server-side (catálogo sin source_url, visor por slug/id)
    permissions.service.ts        # Verificación explícita de acceso adicional a RLS
    powerbi.service.ts            # Servicio Power BI existente (conservado intacto)
  modules/
    registry-meta.ts              # Metadatos server-safe de apps nativas registradas
    registry.ts                   # Registro dinámico cliente (next/dynamic)
    ModuleRenderer.tsx            # Motor central que despacha al visor seguro
    shared/                       # ModuleContainer, ModuleHeader, ModuleLoading, ModuleError
    powerbi/PowerBIViewer.tsx
    html/HTMLViewer.tsx
    documents/PDFViewer.tsx
    applications/
      margin-simulator/           # APP demo funcional: Simulador de Margen y Punto de Equilibrio
      uf-iva-tool/                # TOOL demo funcional: Calculadora Financiera UF / IVA
```

---

## 2. Cómo incorporar una nueva Aplicación React Independiente (ej. Analizador de Cuentas Contables)

No es necesario modificar rutas, sidebar, autenticación ni control de permisos. Solo siga estos **4 pasos**:

1. **Cree su aplicación aislada** en `src/modules/applications/accounting-analyzer/AccountingAnalyzerApp.tsx`:
   ```tsx
   "use client";
   import type { RegisteredModuleProps } from "@/types/modules";

   export default function AccountingAnalyzerApp({ module, profile }: RegisteredModuleProps) {
     return (
       <div className="space-y-4">
         <h2 className="text-lg font-semibold text-[#0D1B2A]">{module.name}</h2>
         {/* Lógica propia de la aplicación */}
       </div>
     );
   }
   ```
2. **Registre sus metadatos** en `src/modules/registry-meta.ts`:
   ```ts
   {
     key: "accounting-analyzer",
     label: "Analizador de Cuentas Contables",
     description: "Análisis detallado de cuentas mayores y variaciones mensuales.",
     moduleType: "APP",
     defaultIcon: "FileSpreadsheet",
     defaultCategory: "Finanzas",
     version: "1.0.0",
   }
   ```
3. **Registre su carga dinámica** en `src/modules/registry.ts`:
   ```ts
   "accounting-analyzer": dynamic(
     () => import("@/modules/applications/accounting-analyzer/AccountingAnalyzerApp"),
     { loading: () => createElement(ModuleLoading, { label: "Cargando Analizador..." }) }
   ),
   ```
4. **Actívela desde el panel administrativo** (`/admin/modulos`):
   - Clic en **Nuevo módulo** → Tipo **Aplicación React nativa** → seleccione *Analizador de Cuentas Contables* → elija categoría, icono y usuarios autorizados → **Crear módulo**.

---

## 3. Cómo incorporar Aplicaciones HTML Externas o Documentos PDF

Por seguridad (OWASP Top 10), la intranet **nunca ejecuta HTML arbitrario** ni utiliza `dangerouslySetInnerHTML`, y exige dominios explícitamente autorizados en las variables de entorno (tanto en `.env.local` como en **Render.com**):

### Aplicaciones HTML externas (`HTML`)
1. Configure en Render (o `.env.local`):
   - `ALLOWED_HTML_APP_HOSTS=apps.findex.cl,*.mi-dominio.cl`
   - `NEXT_PUBLIC_ALLOWED_HTML_HOSTS=apps.findex.cl,*.mi-dominio.cl`
2. En `/admin/modulos` → **Nuevo módulo** → Tipo **App HTML externa**.
3. Ingrese la URL HTTPS y seleccione los permisos mínimos de `sandbox` (nunca se permiten `allow-same-origin` ni `allow-top-navigation`; tampoco se comparten cookies ni JWT de Supabase).

### Documentos PDF (`PDF`)
- Los archivos alojados en **Supabase Storage** (`*.supabase.co`) están autorizados por defecto.
- Para dominios adicionales configure `ALLOWED_DOCUMENT_HOSTS` y `NEXT_PUBLIC_ALLOWED_DOCUMENT_HOSTS`.
- En `/admin/modulos` puede activar o desactivar el botón **Descargar PDF** por documento (`config.allow_download`).

---

## 4. Seguridad y Compatibilidad

- **Doble capa de permisos**: Row Level Security (RLS) en `public.modules` y `public.user_modules` + validación en servidor (`permissions.service.ts`).
- **Mínimo privilegio en payload**: El layout y catálogo de intranet no serializan `source_url` hasta abrir el visor `/intranet/modulos/[slug]`.
- **Protección anti-tamper en favoritos**: El trigger `trg_user_modules_prevent_tamper` permite a los usuarios actualizar únicamente `is_favorite` sobre sus propios módulos asignados.
- **Compatibilidad hacia atrás**:
  - Las tablas originales `public.reports` y `public.user_reports` permanecen intactas.
  - Los enlaces antiguos `/intranet/reportes/[id]` redirigen automáticamente a `/intranet/modulos/[slug]`.
  - `/admin/informes` y `/admin/informes/[id]` redirigen automáticamente a `/admin/modulos` y `/admin/modulos/[id]`.

---

## 5. Reversión Segura (Rollback)

Si alguna vez necesitara volver al estado previo al Motor Universal de Módulos:

1. **Código (Git)**:
   ```bash
   git checkout pre-universal-modules
   # O para revertir en la rama actual sin reescribir historial:
   git revert --no-commit pre-universal-modules..HEAD
   ```
2. **Base de datos (Supabase)**:
   Ejecute `supabase/migrations/20261128_universal_modules_down.sql` en el SQL Editor de Supabase. Las tablas `reports` y `user_reports` originales nunca fueron modificadas ni eliminadas.
