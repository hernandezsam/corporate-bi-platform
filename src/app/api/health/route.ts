import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured(),
  });
}
