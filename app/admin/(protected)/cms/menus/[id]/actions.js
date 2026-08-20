"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function path(menuId) {
  return `/admin/cms/menus/${menuId}`;
}

export async function updateMenu(menuId, prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("menus").update({ name, location: formData.get("location") || "custom" }).eq("id", menuId);
  if (error) return { error: error.message };

  revalidatePath(path(menuId));
  revalidatePath("/admin/cms/menus");
  return { error: null, success: true };
}

export async function addMenuItem(menuId, prevState, formData) {
  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (!label) return { error: "Label is required." };
  if (!url) return { error: "URL is required." };

  const parentId = formData.get("parentId") || null;
  const supabase = createClient();

  let lastQuery = supabase.from("menu_items").select("sort_order").eq("menu_id", menuId);
  lastQuery = parentId ? lastQuery.eq("parent_id", parentId) : lastQuery.is("parent_id", null);
  const { data: last } = await lastQuery.order("sort_order", { ascending: false }).limit(1).maybeSingle();

  const { error } = await supabase.from("menu_items").insert({
    menu_id: menuId,
    parent_id: parentId,
    label,
    url,
    open_in_new_tab: formData.get("openInNewTab") === "on",
    sort_order: (last?.sort_order ?? -1) + 1,
  });
  if (error) return { error: error.message };

  revalidatePath(path(menuId));
  return { error: null };
}

export async function deleteMenuItem(menuId, itemId) {
  const supabase = createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath(path(menuId));
  return { error: null };
}

// Reorder is scoped to siblings (same parent_id) — a nested item only ever
// swaps position with another item under the same parent, never jumping levels.
export async function moveMenuItem(menuId, itemId, direction) {
  const supabase = createClient();
  const { data: item, error: itemError } = await supabase.from("menu_items").select("parent_id").eq("id", itemId).single();
  if (itemError) return { error: itemError.message };

  let siblingsQuery = supabase.from("menu_items").select("id, sort_order").eq("menu_id", menuId);
  siblingsQuery = item.parent_id ? siblingsQuery.eq("parent_id", item.parent_id) : siblingsQuery.is("parent_id", null);
  const { data: siblings, error: fetchError } = await siblingsQuery.order("sort_order", { ascending: true });
  if (fetchError) return { error: fetchError.message };

  const index = siblings.findIndex((s) => s.id === itemId);
  if (index === -1) return { error: "Item not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return { error: null };

  const current = siblings[index];
  const neighbor = siblings[swapIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("menu_items").update({ sort_order: neighbor.sort_order }).eq("id", current.id),
    supabase.from("menu_items").update({ sort_order: current.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1 || e2) return { error: (e1 || e2).message };

  revalidatePath(path(menuId));
  return { error: null };
}
