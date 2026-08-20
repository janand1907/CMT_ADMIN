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

export function TestimonialForm({ action, testimonial, submitLabel }) {
  const [state, formAction] = useFormState(action, { error: null });
  const [image, setImage] = useState(testimonial?.image || null);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Card>
      <CardHeader title="Details" />
      <form action={formAction} className="space-y-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        {state?.success && <Alert tone="success">Saved.</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer Name" htmlFor="customerName" required>
            <Input id="customerName" name="customerName" defaultValue={testimonial?.customer_name || ""} required />
          </Field>
          <Field label="Rating (1-5)" htmlFor="rating">
            <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue={testimonial?.rating || ""} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={testimonial?.status || "active"}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>

        <Field label="Review" htmlFor="review" required>
          <Textarea id="review" name="review" defaultValue={testimonial?.review || ""} rows={4} required />
        </Field>

        <Field label="Photo (optional)">
          <input type="hidden" name="imageMediaId" value={image?.id || ""} />
          <div className="flex items-center gap-3">
            {image ? (
              <img src={getMediaUrl(image.storage_path)} alt="" className="h-16 w-16 rounded-full border border-gray-200 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-300 text-[10px] text-gray-400">
                None
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                {image ? "Change" : "Select Photo"}
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

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} area="testimonials" title="Select Photo" onSelect={setImage} />
    </Card>
  );
}
