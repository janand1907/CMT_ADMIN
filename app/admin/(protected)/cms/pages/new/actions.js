"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPage(prevState, formData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Title is required." };

  const slug = slugify(String(formData.get("slug") || "").trim() || title);
  if (!slug) return { error: "Slug is required." };
  if (slug === "home") return { error: "The \"home\" slug is reserved for the homepage." };

  const supabase = createClient();

  const { data: page, error } = await supabase
    .from("pages")
    .insert({ title, slug, status: "draft" })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A page with this slug already exists." };
    return { error: error.message };
  }

  redirect(`/admin/cms/pages/${page.id}`);
}
