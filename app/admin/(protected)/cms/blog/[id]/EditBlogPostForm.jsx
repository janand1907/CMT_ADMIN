"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateBlogPost } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { MediaPicker } from "@/components/admin/inventory/MediaPicker";
import { getMediaUrl } from "@/lib/media";
import { CONTENT_STATUSES, CONTENT_STATUS_LABELS } from "@/lib/cms/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save
    </Button>
  );
}

export function EditBlogPostForm({ post, categories, tags, canPublish }) {
  const action = updateBlogPost.bind(null, post.id);
  const [state, formAction] = useFormState(action, { error: null });
  const [featuredImage, setFeaturedImage] = useState(post.featured_media || null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedTagIds = new Set((post.tags || []).map((t) => t.id));

  return (
    <Card>
      <CardHeader title="Details" />
      <form action={formAction} className="space-y-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        {state?.success && <Alert tone="success">Saved.</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={post.title} required />
          </Field>
          <Field label="Slug" htmlFor="slug" required>
            <Input id="slug" name="slug" defaultValue={post.slug} required />
          </Field>
          <Field label="Category" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue={post.category_id || ""}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status" hint={!canPublish ? "Publishing needs the Publish Blog permission." : undefined}>
            <Select id="status" name="status" defaultValue={post.status}>
              {CONTENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CONTENT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Excerpt" htmlFor="excerpt">
          <Textarea id="excerpt" name="excerpt" defaultValue={post.excerpt || ""} rows={2} />
        </Field>
        <Field label="Body" htmlFor="body">
          <Textarea id="body" name="body" defaultValue={post.body || ""} rows={10} />
        </Field>

        <Field label="Featured Image">
          <input type="hidden" name="featuredMediaId" value={featuredImage?.id || ""} />
          <div className="flex items-center gap-3">
            {featuredImage ? (
              <img src={getMediaUrl(featuredImage.storage_path)} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 text-[10px] text-gray-400">
                None
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                {featuredImage ? "Change" : "Select Image"}
              </Button>
              {featuredImage && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setFeaturedImage(null)}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </Field>

        {tags.length > 0 && (
          <Field label="Tags">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {tags.map((t) => (
                <Checkbox key={t.id} name="tagIds" value={t.id} label={t.name} defaultChecked={selectedTagIds.has(t.id)} />
              ))}
            </div>
          </Field>
        )}

        <SubmitButton />
      </form>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} area="blog" title="Select Featured Image" onSelect={setFeaturedImage} />
    </Card>
  );
}
