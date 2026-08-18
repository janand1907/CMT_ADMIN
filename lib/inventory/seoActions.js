"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Shared by both the Package and Destination SEO tabs (bound with the
// specific entity_type/entity_id/revalidate path per caller) so the
// upsert-into-seo_metadata logic exists exactly once. entity_type is
// constrained by seo_metadata's own check constraint, so an invalid value
// here fails at the database layer rather than silently writing garbage.
export async function saveSeoMetadata(entityType, entityId, path, prevState, formData) {
  const supabase = createClient();

  const payload = {
    entity_type: entityType,
    entity_id: entityId,
    seo_title: formData.get("seoTitle") || null,
    meta_description: formData.get("metaDescription") || null,
    canonical_url: formData.get("canonicalUrl") || null,
    og_title: formData.get("ogTitle") || null,
    og_description: formData.get("ogDescription") || null,
    og_image_media_id: formData.get("ogImageMediaId") || null,
    indexable: formData.get("indexable") === "on",
  };

  const { error } = await supabase.from("seo_metadata").upsert(payload, { onConflict: "entity_type,entity_id" });
  if (error) return { error: error.message };

  revalidatePath(path);
  return { error: null };
}
