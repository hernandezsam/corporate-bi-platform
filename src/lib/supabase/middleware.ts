import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_INTRANET_ROUTES = [
  "/intranet/login",
  "/intranet/reset-password",
  "/intranet/auth/callback",
];

function isPublicIntranetRoute(pathname: string): boolean {
  return PUBLIC_INTRANET_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedIntranet =
    pathname.startsWith("/intranet") && !isPublicIntranetRoute(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/intranet/login";

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si Supabase aún no está configurado en entorno local, permitir ver la pantalla de aviso
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedIntranet || isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/intranet/login";
      url.searchParams.set("error", "config_missing");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validar sesión contra Supabase Auth (getUser verifica el JWT en el servidor)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedIntranet || isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/intranet/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Consultar perfil en base de datos para validar estado activo y rol real
  if (isProtectedIntranet || isAdminRoute || isLoginRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.active) {
      await supabase.auth.signOut();
      if (!isLoginRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/intranet/login";
        url.searchParams.set("error", "account_disabled");
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    if (isAdminRoute && profile.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/intranet/dashboard";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }

    if (isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/intranet/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
