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

export async function createBlogPost(prevState, formData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Title is required." };

  const slug = slugify(String(formData.get("slug") || "").trim() || title);
  if (!slug) return { error: "Slug is required." };

  const supabase = createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug,
      category_id: formData.get("categoryId") || null,
      excerpt: formData.get("excerpt") || null,
      body: formData.get("body") || "",
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A post with this slug already exists." };
    return { error: error.message };
  }

  redirect(`/admin/cms/blog/${post.id}`);
}
