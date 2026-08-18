"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCategory } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Category
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

export function NewCategoryForm() {
  const [state, formAction] = useFormState(createCategory, { error: null });
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <CardHeader title="Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              required
              onChange={(e) => {
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Slug" htmlFor="slug" required hint="Used in the category's public URL.">
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
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue="active">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description" htmlFor="description">
            <Textarea id="description" name="description" />
          </Field>
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
