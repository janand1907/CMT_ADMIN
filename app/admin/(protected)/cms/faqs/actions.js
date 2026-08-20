"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/admin/cms/faqs";

export async function createFaq(prevState, formData) {
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!question) return { error: "Question is required." };
  if (!answer) return { error: "Answer is required." };

  const supabase = createClient();

  const { data: last } = await supabase.from("faqs").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();

  const { error } = await supabase.from("faqs").insert({
    question,
    answer,
    category: formData.get("category") || null,
    sort_order: (last?.sort_order ?? -1) + 1,
  });
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { error: null };
}

export async function updateFaq(faqId, prevState, formData) {
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!question) return { error: "Question is required." };
  if (!answer) return { error: "Answer is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("faqs")
    .update({ question, answer, category: formData.get("category") || null })
    .eq("id", faqId);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { error: null };
}

export async function deleteFaq(faqId) {
  const supabase = createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", faqId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { error: null };
}

export async function moveFaq(faqId, direction) {
  const supabase = createClient();
  const { data: faqs, error: fetchError } = await supabase.from("faqs").select("id, sort_order").order("sort_order", { ascending: true });
  if (fetchError) return { error: fetchError.message };

  const index = faqs.findIndex((f) => f.id === faqId);
  if (index === -1) return { error: "FAQ not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= faqs.length) return { error: null };

  const current = faqs[index];
  const neighbor = faqs[swapIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("faqs").update({ sort_order: neighbor.sort_order }).eq("id", current.id),
    supabase.from("faqs").update({ sort_order: current.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1 || e2) return { error: (e1 || e2).message };

  revalidatePath(PATH);
  return { error: null };
}
