"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Checkbox } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { MediaPicker } from "@/components/admin/inventory/MediaPicker";
import { getMediaUrl } from "@/lib/media";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save SEO
    </Button>
  );
}

export function SeoForm({ action, seo, mediaArea = "packages" }) {
  const [state, formAction] = useFormState(action, { error: null });
  const [ogImage, setOgImage] = useState(seo?.og_image || null);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Card>
      <CardHeader title="SEO" description="Controls how this appears in search results and social shares." />
      <form action={formAction} className="space-y-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}

        <Field label="SEO Title" htmlFor="seoTitle" hint="Shown as the search result headline.">
          <Input id="seoTitle" name="seoTitle" defaultValue={seo?.seo_title || ""} />
        </Field>
        <Field label="Meta Description" htmlFor="metaDescription">
          <Textarea id="metaDescription" name="metaDescription" defaultValue={seo?.meta_description || ""} rows={3} />
        </Field>
        <Field label="Canonical URL" htmlFor="canonicalUrl">
          <Input id="canonicalUrl" name="canonicalUrl" defaultValue={seo?.canonical_url || ""} placeholder="https://connectmytours.com/..." />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="OG Title" htmlFor="ogTitle">
            <Input id="ogTitle" name="ogTitle" defaultValue={seo?.og_title || ""} />
          </Field>
          <Field label="OG Description" htmlFor="ogDescription">
            <Input id="ogDescription" name="ogDescription" defaultValue={seo?.og_description || ""} />
          </Field>
        </div>

        <Field label="OG Image">
          <input type="hidden" name="ogImageMediaId" value={ogImage?.id || ""} />
          <div className="flex items-center gap-3">
            {ogImage ? (
              <img src={getMediaUrl(ogImage.storage_path)} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 text-[10px] text-gray-400">
                None
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                {ogImage ? "Change" : "Select Image"}
              </Button>
              {ogImage && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setOgImage(null)}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </Field>

        <Checkbox name="indexable" label="Indexable by search engines" defaultChecked={seo?.indexable ?? true} />

        <div>
          <SubmitButton />
        </div>
      </form>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} area={mediaArea} title="Select OG Image" onSelect={setOgImage} />
    </Card>
  );
}
