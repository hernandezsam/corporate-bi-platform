/**
 * Utilidades centralizadas de seguridad defensiva (OWASP Top 10).
 * Diseñadas para ser reversibles y configurables vía variables de entorno.
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

function getExtraAllowedHosts(): string[] {
  const raw =
    process.env.ALLOWED_EMBED_HOSTS ||
    process.env.NEXT_PUBLIC_EXTRA_FRAME_HOSTS ||
    "";
  return raw
    .split(/[\s,]+/)
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Valida que una URL de informe utilice HTTPS y pertenezca a un dominio
 * autorizado de Power BI / Microsoft Fabric (o dominios extra configurados).
 */
export function isAllowedPowerBiUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    if (DEFAULT_ALLOWED_EMBED_HOSTS.includes(host)) return true;
    if (DEFAULT_ALLOWED_EMBED_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
      return true;
    }

    const extras = getExtraAllowedHosts();
    return extras.some(
      (allowed) =>
        host === allowed ||
        (allowed.startsWith("*.") && host.endsWith(allowed.slice(1)))
    );
  } catch {
    return false;
  }
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
 * Verifica que la cabecera Origin (cuando está presente) coincida con el Host actual.
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

// Rate limiter liviano en memoria (ventana deslizante con limpieza automática)
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

  // Limpieza periódica para evitar crecimiento indefinido de memoria
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
