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

export async function updateBlogPost(postId, prevState, formData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Title is required." };

  const slug = slugify(String(formData.get("slug") || "").trim() || title);
  if (!slug) return { error: "Slug is required." };

  const status = formData.get("status");
  if (!["draft", "published", "archived"].includes(status)) return { error: "Invalid status." };

  const supabase = createClient();

  const { data: current } = await supabase.from("blog_posts").select("status").eq("id", postId).maybeSingle();

  const payload = {
    title,
    slug,
    category_id: formData.get("categoryId") || null,
    excerpt: formData.get("excerpt") || null,
    body: formData.get("body") || "",
    featured_media_id: formData.get("featuredMediaId") || null,
    status,
  };
  if (status === "published" && current?.status !== "published") payload.published_at = new Date().toISOString();

  const { error } = await supabase.from("blog_posts").update(payload).eq("id", postId);
  // enforce_publish_permission_trg raises its own exception for a publish_blog-less
  // staff member trying to publish — surfaced as-is, same pattern as pages.
  if (error) {
    if (error.code === "23505") return { error: "A post with this slug already exists." };
    return { error: error.message };
  }

  const tagIds = formData.getAll("tagIds");
  await supabase.from("blog_post_tags").delete().eq("blog_post_id", postId);
  if (tagIds.length > 0) {
    await supabase.from("blog_post_tags").insert(tagIds.map((tagId) => ({ blog_post_id: postId, tag_id: tagId })));
  }

  revalidatePath(`/admin/cms/blog/${postId}`);
  revalidatePath("/admin/cms/blog");
  return { error: null, success: true };
}

export async function saveBlogPostSeo(postId, prevState, formData) {
  return saveSeoMetadata("blog_post", postId, `/admin/cms/blog/${postId}`, prevState, formData);
}
