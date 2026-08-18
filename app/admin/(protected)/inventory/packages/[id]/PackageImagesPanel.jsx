"use client";

import { useState, useTransition } from "react";
import { attachPackageImage, setCoverImage, swapImageOrder, removePackageImage } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { MediaPicker } from "@/components/admin/inventory/MediaPicker";
import { getMediaUrl } from "@/lib/media";

export function PackageImagesPanel({ packageId, images }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function handleSelect(item) {
    setError(null);
    startTransition(async () => {
      const res = await attachPackageImage(packageId, item.id);
      if (res?.error) setError(res.error);
    });
  }

  function handleCover(id) {
    setError(null);
    startTransition(async () => {
      const res = await setCoverImage(packageId, id);
      if (res?.error) setError(res.error);
    });
  }

  function handleMove(idx, direction) {
    const neighborIdx = direction === "left" ? idx - 1 : idx + 1;
    if (neighborIdx < 0 || neighborIdx >= images.length) return;
    setError(null);
    startTransition(async () => {
      const res = await swapImageOrder(
        packageId,
        images[idx].id,
        images[idx].sort_order,
        images[neighborIdx].id,
        images[neighborIdx].sort_order
      );
      if (res?.error) setError(res.error);
    });
  }

  function handleRemove(id) {
    if (!window.confirm("Remove this image from the package?")) return;
    setError(null);
    startTransition(async () => {
      const res = await removePackageImage(id, packageId);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <Card>
      <CardHeader
        title="Images"
        description="The cover image is used as the package thumbnail."
        action={
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            Add Image
          </Button>
        }
      />
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {images.length === 0 ? (
        <EmptyState title="No images yet" description="Add images from the media library." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((img, idx) => (
            <div key={img.id} className="overflow-hidden rounded-xl border border-gray-200">
              <img
                src={getMediaUrl(img.media.storage_path)}
                alt={img.media.alt_text || img.media.file_name}
                className="h-28 w-full object-cover"
              />
              <div className="space-y-1.5 p-2">
                {img.is_cover ? (
                  <Badge tone="primary">Cover</Badge>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleCover(img.id)}
                    className="text-[11px] font-medium text-primary-700 hover:underline disabled:opacity-50"
                  >
                    Set as cover
                  </button>
                )}
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={pending || idx === 0}
                      onClick={() => handleMove(idx, "left")}
                      className="hover:text-gray-700 disabled:opacity-30"
                      aria-label="Move earlier"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={pending || idx === images.length - 1}
                      onClick={() => handleMove(idx, "right")}
                      className="hover:text-gray-700 disabled:opacity-30"
                      aria-label="Move later"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleRemove(img.id)}
                    className="font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} area="packages" title="Add Package Image" onSelect={handleSelect} />
    </Card>
  );
}
