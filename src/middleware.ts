import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Ejecutar middleware en rutas de intranet, admin y autenticación,
     * omitiendo activos estáticos e imágenes para óptimo rendimiento.
     */
    "/intranet/:path*",
    "/admin/:path*",
  ],
};
