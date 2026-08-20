"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/admin/cms/menus";

export async function createMenu(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = createClient();
  const { data: menu, error } = await supabase
    .from("menus")
    .insert({ name, location: formData.get("location") || "custom" })
    .select("id")
    .single();
  if (error) return { error: error.message };

  redirect(`/admin/cms/menus/${menu.id}`);
}

export async function deleteMenu(menuId) {
  const supabase = createClient();
  const { error } = await supabase.from("menus").delete().eq("id", menuId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { error: null };
}
