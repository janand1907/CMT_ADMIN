"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createBlogPost } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Post
    </Button>
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewBlogPostForm({ categories }) {
  const [state, formAction] = useFormState(createBlogPost, { error: null });
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <CardHeader title="Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              name="title"
              required
              onChange={(e) => {
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Slug" htmlFor="slug" required>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </Field>
          <Field label="Category" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue="">
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Excerpt" htmlFor="excerpt">
            <Textarea id="excerpt" name="excerpt" rows={2} />
          </Field>
          <Field label="Body" htmlFor="body">
            <Textarea id="body" name="body" rows={10} />
          </Field>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Tags and the featured image can be set after creating the post.
        </p>
      </Card>

      <SubmitButton />
    </form>
  );
}
