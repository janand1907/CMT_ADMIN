"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveSeoMetadata } from "@/lib/inventory/seoActions";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updatePage(pageId, prevState, formData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Title is required." };

  const slug = slugify(String(formData.get("slug") || "").trim() || title);
  if (!slug) return { error: "Slug is required." };

  const status = formData.get("status");
  if (!["draft", "published", "archived"].includes(status)) return { error: "Invalid status." };

  const supabase = createClient();

  const { data: page } = await supabase.from("pages").select("is_homepage, status").eq("id", pageId).maybeSingle();
  if (page?.is_homepage && slug !== "home") {
    return { error: 'The homepage\'s slug must stay "home".' };
  }

  const payload = { title, slug, status };
  if (status === "published" && page?.status !== "published") payload.published_at = new Date().toISOString();

  const { error } = await supabase.from("pages").update(payload).eq("id", pageId);
  // enforce_publish_permission_trg raises its own readable exception for a
  // publish_pages-less staff member trying to publish — surfaced as-is, same
  // reliance-on-DB-constraint pattern as quotations' updateQuotationStatus.
  if (error) {
    if (error.code === "23505") return { error: "A page with this slug already exists." };
    return { error: error.message };
  }

  revalidatePath(`/admin/cms/pages/${pageId}`);
  revalidatePath("/admin/cms/pages");
  return { error: null, success: true };
}

export async function savePageSeo(pageId, prevState, formData) {
  return saveSeoMetadata("page", pageId, `/admin/cms/pages/${pageId}`, prevState, formData);
}
