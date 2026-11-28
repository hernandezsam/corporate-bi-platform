/**
 * Utilidades centralizadas de seguridad defensiva (OWASP Top 10)
 * para el Motor Universal de Módulos Corporativos de Findex.
 */

const DEFAULT_ALLOWED_EMBED_HOSTS = [
  "app.powerbi.com",
  "msit.powerbi.com",
  "app.fabric.microsoft.com",
];

const DEFAULT_ALLOWED_EMBED_SUFFIXES = [
  ".powerbi.com",
  ".analysis.windows.net",
  ".fabric.microsoft.com",
];

const ALLOWED_HTML_SANDBOX_TOKENS = new Set([
  "allow-scripts",
  "allow-forms",
  "allow-popups",
  "allow-downloads",
  "allow-modals",
]);

const ALLOWED_IFRAME_ALLOW_DIRECTIVES = new Set([
  "fullscreen",
  "clipboard-write",
]);

function parseHostList(raw: string | undefined): string[] {
  return (raw || "")
    .split(/[\s,]+/)
    .map((h) => h.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
    .filter(Boolean);
}

function isPrivateOrLocalHostname(host: string): boolean {
  const lower = host.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }
  // Bloquear direcciones IPv4 privadas / loopback / link-local (SSRF / LAN pivot)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(lower)) {
    const [a, b] = lower.split(".").map(Number);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return true;
    }
  }
  return false;
}

function matchesAllowlist(host: string, allowlist: string[]): boolean {
  return allowlist.some((pattern) => {
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1); // ".example.com"
      return host.endsWith(suffix) && host.length > suffix.length;
    }
    return host === pattern;
  });
}

/**
 * Valida que una URL Power BI utilice HTTPS y pertenezca a un dominio autorizado.
 */
export function isAllowedPowerBiUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    if (isPrivateOrLocalHostname(host)) return false;

    if (DEFAULT_ALLOWED_EMBED_HOSTS.includes(host)) return true;
    if (DEFAULT_ALLOWED_EMBED_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
      return true;
    }

    const extras = [
      ...parseHostList(process.env.ALLOWED_EMBED_HOSTS),
      ...parseHostList(process.env.NEXT_PUBLIC_EXTRA_FRAME_HOSTS),
    ];
    return matchesAllowlist(host, extras);
  } catch {
    return false;
  }
}

/**
 * Valida URLs de aplicaciones HTML externas (HTTPS + allowlist explícita).
 * Configurar ALLOWED_HTML_APP_HOSTS / NEXT_PUBLIC_ALLOWED_HTML_HOSTS en Render/.env.
 */
export function isAllowedHtmlAppUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    if (isPrivateOrLocalHostname(host)) return false;

    const allowlist = [
      ...parseHostList(process.env.ALLOWED_HTML_APP_HOSTS),
      ...parseHostList(process.env.NEXT_PUBLIC_ALLOWED_HTML_HOSTS),
      ...parseHostList(process.env.NEXT_PUBLIC_EXTRA_FRAME_HOSTS),
    ];

    if (allowlist.length === 0) return false;
    return matchesAllowlist(host, allowlist);
  } catch {
    return false;
  }
}

/**
 * Valida URLs de documentos PDF corporativos (HTTPS + Supabase Storage o allowlist).
 */
export function isAllowedDocumentUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    if (isPrivateOrLocalHostname(host)) return false;

    // Permitir Supabase Storage del proyecto y dominios explícitamente autorizados
    if (host.endsWith(".supabase.co")) return true;

    const allowlist = [
      ...parseHostList(process.env.ALLOWED_DOCUMENT_HOSTS),
      ...parseHostList(process.env.NEXT_PUBLIC_ALLOWED_DOCUMENT_HOSTS),
      ...parseHostList(process.env.NEXT_PUBLIC_EXTRA_FRAME_HOSTS),
    ];
    return matchesAllowlist(host, allowlist);
  } catch {
    return false;
  }
}

/**
 * Filtra los tokens de sandbox de iframes HTML externos bajo principio de mínimo privilegio.
 * Nunca permite allow-same-origin ni allow-top-navigation.
 */
export function sanitizeSandboxTokens(tokens?: string[]): string {
  const requested =
    Array.isArray(tokens) && tokens.length > 0
      ? tokens
      : ["allow-scripts", "allow-forms"];
  const safe = requested.filter((t) => ALLOWED_HTML_SANDBOX_TOKENS.has(t));
  return (safe.length > 0 ? safe : ["allow-scripts"]).join(" ");
}

/**
 * Filtra la política allow de iframes externos.
 */
export function sanitizeIframeAllow(directives?: string[]): string {
  if (!Array.isArray(directives) || directives.length === 0) {
    return "fullscreen";
  }
  const safe = directives.filter((d) => ALLOWED_IFRAME_ALLOW_DIRECTIVES.has(d));
  return (safe.length > 0 ? safe : ["fullscreen"]).join("; ");
}

/**
 * Convierte un nombre en un slug URL-safe limpio (a-z0-9-).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Previene Open Redirect (bloquea //evil.com, /\evil.com, esquemas externos, etc.).
 */
export function sanitizeInternalPath(
  raw: string | null | undefined,
  fallback = "/intranet/dashboard"
): string {
  if (!raw || !/^\/(?![/\\])/.test(raw)) {
    return fallback;
  }
  try {
    const parsed = new URL(raw, "https://internal.local");
    if (parsed.origin !== "https://internal.local") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

/**
 * Defensa en profundidad contra CSRF para peticiones de mutación basadas en cookies.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

interface Bucket {
  timestamps: number[];
}

const rateLimitStore = new Map<string, Bucket>();
let lastPruneAt = Date.now();

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - options.windowMs;

  if (now - lastPruneAt > 60_000 || rateLimitStore.size > 5_000) {
    for (const [k, bucket] of rateLimitStore.entries()) {
      const fresh = bucket.timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) rateLimitStore.delete(k);
      else bucket.timestamps = fresh;
    }
    lastPruneAt = now;
  }

  const bucket = rateLimitStore.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldest + options.windowMs - now) / 1000)
    );
    rateLimitStore.set(key, bucket);
    return { allowed: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  rateLimitStore.set(key, bucket);
  return { allowed: true, retryAfterSec: 0 };
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
