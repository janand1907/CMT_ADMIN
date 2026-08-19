"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/admin/marketing/templates";

function validateBodyText(bodyText) {
  const placeholders = new Set();
  const regex = /\{\{(\d+)\}\}/g;
  let match;
  while ((match = regex.exec(bodyText)) !== null) {
    placeholders.add(Number(match[1]));
  }
  if (placeholders.size > 0 && Math.min(...placeholders) !== 1) {
    return "Template variables must start from {{1}} and be sequential.";
  }
  const max = placeholders.size > 0 ? Math.max(...placeholders) : 0;
  const expected = new Set(Array.from({ length: max }, (_, i) => i + 1));
  for (const n of expected) {
    if (!placeholders.has(n)) {
      return `Template variable {{${n}}} is referenced in the body but missing. Variables must be sequential.`;
    }
  }
  return null;
}

export async function saveTemplate(templateId, prevState, formData) {
  const supabase = createClient();

  const name = String(formData.get("name") || "").trim();
  const bodyText = String(formData.get("bodyText") || "").trim();
  const category = formData.get("category");
  const purpose = formData.get("purpose");
  const providerTemplateName = String(formData.get("providerTemplateName") || "").trim() || null;
  const headerText = String(formData.get("headerText") || "").trim() || null;
  const footerText = String(formData.get("footerText") || "").trim() || null;
  const status = formData.get("status") || "active";

  if (!name) return { error: "Template name is required." };
  if (!bodyText) return { error: "Body text is required." };
  if (!["utility", "marketing", "authentication"].includes(category)) {
    return { error: "Invalid category." };
  }
  if (!["enquiry_confirmation", "quotation", "followup_morning", "followup_evening", "campaign", "manual"].includes(purpose)) {
    return { error: "Invalid purpose." };
  }

  const validationError = validateBodyText(bodyText);
  if (validationError) return { error: validationError };

  // Check uniqueness of provider_template_name when provided (excluding current row on edit)
  if (providerTemplateName) {
    const { data: existing } = await supabase
      .from("whatsapp_templates")
      .select("id")
      .eq("provider_template_name", providerTemplateName)
      .neq("id", templateId || "00000000-0000-0000-0000-000000000000")
      .maybeSingle();
    if (existing) {
      return { error: `Another template already uses provider name "${providerTemplateName}".` };
    }
  }

  if (templateId) {
    const { error } = await supabase
      .from("whatsapp_templates")
      .update({ name, purpose, category, provider_template_name: providerTemplateName, body_text: bodyText, header_text: headerText, footer_text: footerText, status })
      .eq("id", templateId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("whatsapp_templates")
      .insert({ name, purpose, category, provider_template_name: providerTemplateName, body_text: bodyText, header_text: headerText, footer_text: footerText, status });
    if (error) return { error: error.message };
  }

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteTemplate(templateId) {
  const supabase = createClient();

  const { error } = await supabase
    .from("whatsapp_templates")
    .update({ status: "inactive" })
    .eq("id", templateId);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { success: true };
}
