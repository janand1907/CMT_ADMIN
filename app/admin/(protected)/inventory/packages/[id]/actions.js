"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function packagePath(packageId) {
  return `/admin/inventory/packages/${packageId}`;
}

// ---------------------------------------------------------------------------
// Details
// ---------------------------------------------------------------------------

export async function updatePackageDetails(packageId, prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required.", success: false };

  const slug = slugify(String(formData.get("slug") || "").trim() || name);
  if (!slug) return { error: "Slug is required.", success: false };

  const durationDaysRaw = formData.get("durationDays");
  const durationNightsRaw = formData.get("durationNights");

  const supabase = createClient();
  const { error } = await supabase
    .from("packages")
    .update({
      name,
      slug,
      destination_id: formData.get("destinationId") || null,
      category_id: formData.get("categoryId") || null,
      package_type: formData.get("packageType") || null,
      room_category: formData.get("roomCategory") || null,
      duration_days: durationDaysRaw ? parseInt(durationDaysRaw, 10) : null,
      duration_nights: durationNightsRaw ? parseInt(durationNightsRaw, 10) : null,
      short_description: formData.get("shortDescription") || null,
      status: formData.get("status") || "inactive",
      featured: formData.get("featured") === "on",
      is_available: formData.get("isAvailable") === "on",
    })
    .eq("id", packageId);

  if (error) {
    if (error.code === "23505") return { error: "A package with this slug already exists.", success: false };
    return { error: error.message, success: false };
  }

  revalidatePath(packagePath(packageId));
  revalidatePath("/admin/inventory/packages");
  return { error: null, success: true };
}

export async function deletePackage(packageId) {
  const supabase = createClient();
  const { error } = await supabase.from("packages").delete().eq("id", packageId);
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory/packages");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Content (description, itinerary, inclusions/exclusions)
// ---------------------------------------------------------------------------

export async function updatePackageContent(packageId, prevState, formData) {
  let itinerary = [];
  try {
    itinerary = JSON.parse(String(formData.get("itinerary") || "[]"));
    if (!Array.isArray(itinerary)) throw new Error("not an array");
  } catch {
    return { error: "Itinerary data is invalid." };
  }

  itinerary = itinerary
    .map((d, i) => ({
      day: i + 1,
      title: String(d?.title || "").trim(),
      description: String(d?.description || "").trim(),
    }))
    .filter((d) => d.title || d.description);

  const inclusions = String(formData.get("inclusions") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const exclusions = String(formData.get("exclusions") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const supabase = createClient();
  const { error } = await supabase
    .from("packages")
    .update({
      description: formData.get("description") || null,
      itinerary,
      inclusions,
      exclusions,
    })
    .eq("id", packageId);

  if (error) return { error: error.message };
  revalidatePath(packagePath(packageId));
  return { error: null };
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export async function addPricing(packageId, prevState, formData) {
  const price = parseFloat(formData.get("price"));
  if (Number.isNaN(price) || price < 0) return { error: "Enter a valid price.", success: false };

  const supabase = createClient();
  const { error } = await supabase.from("package_pricing").insert({
    package_id: packageId,
    pricing_type: formData.get("pricingType") || "rack",
    label: formData.get("label") || null,
    price,
    currency: formData.get("currency") || "INR",
    valid_from: formData.get("validFrom") || null,
    valid_to: formData.get("validTo") || null,
    is_active: formData.get("isActive") === "on",
  });

  if (error) return { error: error.message, success: false };
  revalidatePath(packagePath(packageId));
  return { error: null, success: true };
}

export async function updatePricing(pricingId, packageId, prevState, formData) {
  const price = parseFloat(formData.get("price"));
  if (Number.isNaN(price) || price < 0) return { error: "Enter a valid price.", success: false };

  const supabase = createClient();
  const { error } = await supabase
    .from("package_pricing")
    .update({
      pricing_type: formData.get("pricingType") || "rack",
      label: formData.get("label") || null,
      price,
      currency: formData.get("currency") || "INR",
      valid_from: formData.get("validFrom") || null,
      valid_to: formData.get("validTo") || null,
      is_active: formData.get("isActive") === "on",
    })
    .eq("id", pricingId);

  if (error) return { error: error.message, success: false };
  revalidatePath(packagePath(packageId));
  return { error: null, success: true };
}

export async function deletePricing(pricingId, packageId) {
  const supabase = createClient();
  const { error } = await supabase.from("package_pricing").delete().eq("id", pricingId);
  if (error) return { error: error.message };
  revalidatePath(packagePath(packageId));
  return { error: null };
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export async function attachPackageImage(packageId, mediaId) {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("package_images")
    .select("sort_order")
    .eq("package_id", packageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (existing?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("package_images").insert({
    package_id: packageId,
    media_id: mediaId,
    sort_order: nextSort,
    is_cover: nextSort === 0,
  });

  if (error) {
    if (error.code === "23505") return { error: "This image is already attached to the package." };
    return { error: error.message };
  }

  revalidatePath(packagePath(packageId));
  return { error: null };
}

export async function setCoverImage(packageId, packageImageId) {
  const supabase = createClient();

  const { error: clearError } = await supabase
    .from("package_images")
    .update({ is_cover: false })
    .eq("package_id", packageId);
  if (clearError) return { error: clearError.message };

  const { error } = await supabase.from("package_images").update({ is_cover: true }).eq("id", packageImageId);
  if (error) return { error: error.message };

  revalidatePath(packagePath(packageId));
  return { error: null };
}

export async function swapImageOrder(packageId, imageIdA, sortOrderA, imageIdB, sortOrderB) {
  const supabase = createClient();

  const { error: err1 } = await supabase.from("package_images").update({ sort_order: sortOrderB }).eq("id", imageIdA);
  const { error: err2 } = await supabase.from("package_images").update({ sort_order: sortOrderA }).eq("id", imageIdB);
  if (err1 || err2) return { error: (err1 || err2).message };

  revalidatePath(packagePath(packageId));
  return { error: null };
}

export async function removePackageImage(packageImageId, packageId) {
  const supabase = createClient();
  const { error } = await supabase.from("package_images").delete().eq("id", packageImageId);
  if (error) return { error: error.message };

  revalidatePath(packagePath(packageId));
  return { error: null };
}
