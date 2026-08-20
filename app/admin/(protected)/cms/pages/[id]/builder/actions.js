"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BLOCK_TYPES } from "@/lib/cms/constants";

function path(pageId) {
  return `/admin/cms/pages/${pageId}/builder`;
}

export async function addSection(pageId, blockType) {
  if (!BLOCK_TYPES.includes(blockType)) return { error: "Invalid block type." };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("page_sections")
    .select("sort_order")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (existing?.sort_order ?? -1) + 1;

  const { error } = await supabase
    .from("page_sections")
    .insert({ page_id: pageId, block_type: blockType, content: {}, sort_order: nextOrder });
  if (error) return { error: error.message };

  revalidatePath(path(pageId));
  return { error: null };
}

export async function updateSectionContent(pageId, sectionId, content) {
  const supabase = createClient();
  const { error } = await supabase.from("page_sections").update({ content }).eq("id", sectionId);
  if (error) return { error: error.message };

  revalidatePath(path(pageId));
  return { error: null };
}

export async function toggleSectionEnabled(pageId, sectionId, enabled) {
  const supabase = createClient();
  const { error } = await supabase.from("page_sections").update({ enabled }).eq("id", sectionId);
  if (error) return { error: error.message };

  revalidatePath(path(pageId));
  return { error: null };
}

export async function deleteSection(pageId, sectionId) {
  const supabase = createClient();
  const { error } = await supabase.from("page_sections").delete().eq("id", sectionId);
  if (error) return { error: error.message };

  revalidatePath(path(pageId));
  return { error: null };
}

// Button-based reorder (no drag library) — swaps sort_order with the immediate
// neighbor in the current order, so "move up"/"move down" is always a single,
// unambiguous two-row swap regardless of gaps in sort_order.
export async function moveSection(pageId, sectionId, direction) {
  const supabase = createClient();
  const { data: sections, error: fetchError } = await supabase
    .from("page_sections")
    .select("id, sort_order")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (fetchError) return { error: fetchError.message };

  const index = sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return { error: "Section not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sections.length) return { error: null };

  const current = sections[index];
  const neighbor = sections[swapIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("page_sections").update({ sort_order: neighbor.sort_order }).eq("id", current.id),
    supabase.from("page_sections").update({ sort_order: current.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1 || e2) return { error: (e1 || e2).message };

  revalidatePath(path(pageId));
  return { error: null };
}

export async function saveVersion(pageId, prevState, formData) {
  const note = String(formData.get("note") || "").trim() || null;
  const supabase = createClient();

  const [{ data: page, error: pageError }, { data: sections, error: sectionsError }] = await Promise.all([
    supabase.from("pages").select("title, status").eq("id", pageId).single(),
    supabase
      .from("page_sections")
      .select("block_type, content, enabled, sort_order")
      .eq("page_id", pageId)
      .order("sort_order", { ascending: true }),
  ]);
  if (pageError) return { error: pageError.message };
  if (sectionsError) return { error: sectionsError.message };

  const { data: lastVersion } = await supabase
    .from("page_versions")
    .select("version_number")
    .eq("page_id", pageId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("page_versions").insert({
    page_id: pageId,
    version_number: (lastVersion?.version_number ?? 0) + 1,
    title: page.title,
    status: page.status,
    sections: sections || [],
    note,
  });
  if (error) return { error: error.message };

  revalidatePath(path(pageId));
  return { error: null, success: true };
}

// Replaces the live page_sections with a version's snapshot — application code,
// not a DB function, per this codebase's convention of keeping multi-step,
// non-concurrency-sensitive business logic in server actions (see
// lib/whatsapp/campaigns.js's identical reasoning). Does not touch page_versions
// itself (history stays append-only) and does not change the page's title/status
// — rollback restores content blocks only, so an already-published page doesn't
// silently flip back to draft.
export async function rollbackToVersion(pageId, versionId) {
  const supabase = createClient();

  const { data: version, error: versionError } = await supabase
    .from("page_versions")
    .select("sections")
    .eq("id", versionId)
    .eq("page_id", pageId)
    .single();
  if (versionError) return { error: versionError.message };

  const { error: deleteError } = await supabase.from("page_sections").delete().eq("page_id", pageId);
  if (deleteError) return { error: deleteError.message };

  const rows = (version.sections || []).map((s) => ({
    page_id: pageId,
    block_type: s.block_type,
    content: s.content,
    enabled: s.enabled,
    sort_order: s.sort_order,
  }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("page_sections").insert(rows);
    if (insertError) return { error: insertError.message };
  }

  revalidatePath(path(pageId));
  return { error: null, success: true };
}
