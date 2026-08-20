"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { ALLOWED_MEDIA_MIME_TYPES, MAX_MEDIA_SIZE_BYTES, MEDIA_AREAS } from "@/lib/media";
import { sanitizeSvg } from "@/lib/media/sanitizeSvg";

function slugifyFileName(name) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const slug = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "file";
}

// Re-encodes uploaded raster images to WebP via sharp (already a project
// dependency) so the media library stores a modern, compressed format by
// default, per master plan §11 "Image optimization / WebP where appropriate".
// SVGs aren't re-encoded (already vector/lossless) but are sanitized
// (sanitizeSvg) before storage — an SVG opened directly from its public
// Storage URL executes any embedded script, unlike a raster image or an
// <img src="...svg"> reference (Phase 8).
export async function uploadMedia(prevState, formData) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_media"]);
  if (!perms.manage_media) return { error: "You don't have permission to upload media." };

  const area = String(formData.get("area") || "");
  if (!MEDIA_AREAS.includes(area)) return { error: "Invalid media area." };

  const files = formData.getAll("files").filter((f) => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Select at least one file to upload." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let uploadedCount = 0;
  let lastUploaded = null;
  const errors = [];

  for (const file of files) {
    if (!ALLOWED_MEDIA_MIME_TYPES.includes(file.type)) {
      errors.push(`${file.name}: unsupported file type.`);
      continue;
    }
    if (file.size > MAX_MEDIA_SIZE_BYTES) {
      errors.push(`${file.name}: file too large (max 8MB).`);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let outBuffer = buffer;
    let outMime = file.type;
    let outExt = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1] || "bin";
    let width = null;
    let height = null;

    if (file.type !== "image/svg+xml") {
      try {
        const image = sharp(buffer);
        const meta = await image.metadata();
        width = meta.width || null;
        height = meta.height || null;
        if (file.type !== "image/webp" && file.type !== "image/gif") {
          outBuffer = await image.webp({ quality: 82 }).toBuffer();
          outMime = "image/webp";
          outExt = "webp";
          width = meta.width || null;
          height = meta.height || null;
        }
      } catch {
        errors.push(`${file.name}: could not read image data.`);
        continue;
      }
    } else {
      outBuffer = Buffer.from(sanitizeSvg(buffer.toString("utf-8")), "utf-8");
    }

    const storagePath = `${area}/${crypto.randomUUID()}.${outExt}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, outBuffer, { contentType: outMime, upsert: false });
    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("media")
      .insert({
        area,
        storage_path: storagePath,
        file_name: `${slugifyFileName(file.name)}.${outExt}`,
        mime_type: outMime,
        size_bytes: outBuffer.length,
        width,
        height,
        alt_text: null,
        uploaded_by: user?.id || null,
      })
      .select("id, area, storage_path, file_name, mime_type, size_bytes, width, height, alt_text, created_at")
      .single();

    if (insertError) {
      await supabase.storage.from("media").remove([storagePath]);
      errors.push(`${file.name}: ${insertError.message}`);
      continue;
    }

    uploadedCount += 1;
    lastUploaded = inserted;
  }

  revalidatePath("/admin/inventory/media");

  if (uploadedCount === 0) return { error: errors.join(" ") || "Upload failed." };
  return {
    error: errors.length ? errors.join(" ") : null,
    success: `${uploadedCount} file${uploadedCount === 1 ? "" : "s"} uploaded.`,
    uploaded: lastUploaded,
  };
}

export async function updateMediaMeta(mediaId, prevState, formData) {
  const fileName = String(formData.get("fileName") || "").trim();
  if (!fileName) return { error: "File name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("media")
    .update({ file_name: fileName, alt_text: formData.get("altText") || null })
    .eq("id", mediaId);
  if (error) return { error: error.message };

  revalidatePath("/admin/inventory/media");
  return { error: null };
}

export async function deleteMedia(mediaId, storagePath) {
  const supabase = createClient();
  const { error: dbError } = await supabase.from("media").delete().eq("id", mediaId);
  if (dbError) return { error: dbError.message };

  // Row is gone (and any package_images referencing it cascaded) even if the
  // storage object removal below fails — don't report an error for an orphan
  // object, since the metadata the UI cares about is already cleaned up.
  await supabase.storage.from("media").remove([storagePath]);

  revalidatePath("/admin/inventory/media");
  return { error: null };
}
