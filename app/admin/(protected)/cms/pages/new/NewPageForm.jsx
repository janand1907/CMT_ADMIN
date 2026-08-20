"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createPage } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Page
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

export function NewPageForm() {
  const [state, formAction] = useFormState(createPage, { error: null });
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
          <Field label="Slug" htmlFor="slug" required hint="Used in the page's public URL.">
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
        </div>
        <p className="mt-3 text-xs text-gray-400">
          The page is created as a draft with no content blocks — add sections from the Page Builder after creating it.
        </p>
      </Card>

      <SubmitButton />
    </form>
  );
}
