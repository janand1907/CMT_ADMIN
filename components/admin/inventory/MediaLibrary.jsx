"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { uploadMedia, updateMediaMeta, deleteMedia } from "@/app/admin/(protected)/inventory/media/actions";
import { Button } from "@/components/admin/ui/Button";
import { Dialog } from "@/components/admin/ui/Dialog";
import { Field, Input, Select } from "@/components/admin/ui/FormControls";
import { Alert } from "@/components/admin/ui/Alert";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { MEDIA_AREAS, MEDIA_AREA_LABELS, getMediaUrl, formatFileSize } from "@/lib/media";

function UploadSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Upload
    </Button>
  );
}

function UploadDialog({ open, onClose }) {
  const [state, formAction] = useFormState(uploadMedia, { error: null, success: null });

  return (
    <Dialog open={open} onClose={onClose} title="Upload Media" size="md">
      <form action={formAction} className="space-y-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        {state?.success && <Alert tone="success">{state.success}</Alert>}

        <Field label="Area" htmlFor="area" required hint="Where this media will be used.">
          <Select id="area" name="area" defaultValue="packages" required>
            {MEDIA_AREAS.map((a) => (
              <option key={a} value={a}>
                {MEDIA_AREA_LABELS[a]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Files" htmlFor="files" required hint="JPEG, PNG, WebP, GIF or SVG. Max 8MB each.">
          <input
            id="files"
            name="files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            required
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <UploadSubmitButton />
        </div>
      </form>
    </Dialog>
  );
}

function EditMediaDialog({ item, onClose }) {
  const [state, formAction] = useFormState(updateMediaMeta.bind(null, item?.id), { error: null });

  return (
    <Dialog open={!!item} onClose={onClose} title="Edit Media" size="sm">
      {item && (
        <form action={formAction} className="space-y-4">
          {state?.error && <Alert tone="error">{state.error}</Alert>}
          <img src={getMediaUrl(item.storage_path)} alt={item.alt_text || ""} className="h-32 w-full rounded-lg object-cover" />
          <Field label="File name" htmlFor="fileName" required>
            <Input id="fileName" name="fileName" defaultValue={item.file_name} required />
          </Field>
          <Field label="Alt text" htmlFor="altText" hint="Used for accessibility and SEO.">
            <Input id="altText" name="altText" defaultValue={item.alt_text || ""} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function MediaCard({ item, usageCount, canManage, onEdit }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function handleDelete() {
    const usageNote = usageCount > 0 ? ` It is currently used in ${usageCount} package image slot(s), which will also be removed.` : "";
    if (!window.confirm(`Delete "${item.file_name}"? This cannot be undone.${usageNote}`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteMedia(item.id, item.storage_path);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <img src={getMediaUrl(item.storage_path)} alt={item.alt_text || item.file_name} className="h-32 w-full object-cover" loading="lazy" />
      <div className="space-y-1.5 p-3">
        <p className="truncate text-xs font-medium text-gray-800" title={item.file_name}>
          {item.file_name}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="gray">{MEDIA_AREA_LABELS[item.area] || item.area}</Badge>
          {usageCount > 0 && <Badge tone="blue">Used ×{usageCount}</Badge>}
        </div>
        <p className="text-[11px] text-gray-400">
          {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
          {formatFileSize(item.size_bytes)}
        </p>
        {error && <p className="text-[11px] text-red-600">{error}</p>}
        {canManage && (
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => onEdit(item)} className="text-xs font-medium text-primary-700 hover:underline">
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function MediaLibrary({ media, usageCounts, activeArea, canManage }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          <Link
            href="/admin/inventory/media"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${!activeArea ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            All
          </Link>
          {MEDIA_AREAS.map((a) => (
            <Link
              key={a}
              href={`/admin/inventory/media?area=${a}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${activeArea === a ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {MEDIA_AREA_LABELS[a]}
            </Link>
          ))}
        </div>
        {canManage && <Button onClick={() => setUploadOpen(true)}>Upload Media</Button>}
      </div>

      {media.length === 0 ? (
        <EmptyState title="No media yet" description="Upload images to use across packages, destinations, and other content." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((item) => (
            <MediaCard key={item.id} item={item} usageCount={usageCounts[item.id] || 0} canManage={canManage} onEdit={setEditing} />
          ))}
        </div>
      )}

      {canManage && <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />}
      {canManage && <EditMediaDialog item={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
