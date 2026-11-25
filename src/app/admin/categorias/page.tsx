import type { Metadata } from "next";
import { requireAdminUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CategoriesManager } from "@/components/admin/categories-manager";
import type { Category } from "@/types/database";

export const metadata: Metadata = {
  title: "Categorías",
};

export default async function AdminCategoriasPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <CategoriesManager initialCategories={(categories as Category[]) ?? []} />
  );
}
