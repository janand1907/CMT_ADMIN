"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { MediaPicker } from "@/components/admin/inventory/MediaPicker";
import { getMediaUrl } from "@/lib/media";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {children}
    </Button>
  );
}

export function BannerForm({ action, banner, submitLabel }) {
  const [state, formAction] = useFormState(action, { error: null });
  const [image, setImage] = useState(banner?.image || null);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Card>
      <CardHeader title="Details" />
      <form action={formAction} className="space-y-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        {state?.success && <Alert tone="success">Saved.</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading" htmlFor="heading">
            <Input id="heading" name="heading" defaultValue={banner?.heading || ""} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={banner?.status || "inactive"}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
          <Field label="CTA Text" htmlFor="ctaText">
            <Input id="ctaText" name="ctaText" defaultValue={banner?.cta_text || ""} />
          </Field>
          <Field label="CTA Link" htmlFor="ctaLink">
            <Input id="ctaLink" name="ctaLink" defaultValue={banner?.cta_link || ""} placeholder="https://..." />
          </Field>
          <Field label="Start Date" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={banner?.start_date || ""} />
          </Field>
          <Field label="End Date" htmlFor="endDate">
            <Input id="endDate" name="endDate" type="date" defaultValue={banner?.end_date || ""} />
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={banner?.description || ""} rows={3} />
        </Field>

        <Field label="Image">
          <input type="hidden" name="imageMediaId" value={image?.id || ""} />
          <div className="flex items-center gap-3">
            {image ? (
              <img src={getMediaUrl(image.storage_path)} alt="" className="h-16 w-28 rounded-lg border border-gray-200 object-cover" />
            ) : (
              <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-gray-300 text-[10px] text-gray-400">
                None
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                {image ? "Change" : "Select Image"}
              </Button>
              {image && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setImage(null)}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </Field>

        <SubmitButton>{submitLabel}</SubmitButton>
      </form>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} area="banners" title="Select Image" onSelect={setImage} />
    </Card>
  );
}
