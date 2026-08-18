"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { uploadMedia } from "@/app/admin/(protected)/inventory/media/actions";
import { Dialog } from "@/components/admin/ui/Dialog";
import { Button } from "@/components/admin/ui/Button";
import { Field } from "@/components/admin/ui/FormControls";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { SkeletonRows } from "@/components/admin/ui/Skeleton";
import { getMediaUrl } from "@/lib/media";

function UploadSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} size="sm">
      Upload
    </Button>
  );
}

// Reused by the Package Images tab and every SEO OG-image field so "pick an
// existing file or upload a new one" isn't rebuilt per caller. Fetches
// client-side (this opens mid-page, inside an already-rendered Server
// Component tree) via the browser Supabase client, which still enforces the
// same media_select_scoped RLS policy as the server client.
export function MediaPicker({ open, onClose, area, onSelect, title = "Select Media" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("library");
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadState, uploadAction] = useFormState(uploadMedia, { error: null, success: null, uploaded: null });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("media")
      .select("id, storage_path, file_name, alt_text, width, height")
      .eq("area", area)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setItems(data || []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, area, refreshKey]);

  useEffect(() => {
    if (uploadState?.uploaded) {
      setRefreshKey((k) => k + 1);
      setTab("library");
    }
  }, [uploadState]);

  return (
    <Dialog open={open} onClose={onClose} title={title} size="lg">
      <div className="mb-3 flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("library")}
          className={`border-b-2 px-3 py-2 text-sm font-medium transition ${tab === "library" ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`border-b-2 px-3 py-2 text-sm font-medium transition ${tab === "upload" ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Upload New
        </button>
      </div>

      {tab === "library" ? (
        loading ? (
          <SkeletonRows rows={4} />
        ) : items.length === 0 ? (
          <EmptyState title="No media in this area yet" description='Switch to "Upload New" to add some.' />
        ) : (
          <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="overflow-hidden rounded-lg border border-gray-200 text-left transition hover:ring-2 hover:ring-primary-500"
              >
                <img src={getMediaUrl(item.storage_path)} alt={item.alt_text || item.file_name} className="h-20 w-full object-cover" />
                <p className="truncate px-1.5 py-1 text-[11px] text-gray-600">{item.file_name}</p>
              </button>
            ))}
          </div>
        )
      ) : (
        <form action={uploadAction} className="space-y-4">
          {uploadState?.error && <Alert tone="error">{uploadState.error}</Alert>}
          <input type="hidden" name="area" value={area} />
          <Field label="Files" htmlFor="picker-files" required hint="JPEG, PNG, WebP, GIF or SVG. Max 8MB each.">
            <input
              id="picker-files"
              name="files"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              required
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
            />
          </Field>
          <UploadSubmitButton />
        </form>
      )}
    </Dialog>
  );
}
