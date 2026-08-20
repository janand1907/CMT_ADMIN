"use client";

import { useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createBlogCategory, deleteBlogCategory, createBlogTag, deleteBlogTag } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      {children}
    </Button>
  );
}

function DeleteButton({ action, id, label }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Delete "${label}"? This cannot be undone.`)) startTransition(() => action(id));
      }}
      className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

export function BlogCategoriesAndTagsManager({ categories, tags }) {
  const [categoryState, categoryFormAction] = useFormState(createBlogCategory, { error: null });
  const [tagState, tagFormAction] = useFormState(createBlogTag, { error: null });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Categories" description="Group blog posts into topics." />
        <form action={categoryFormAction} className="mb-4 flex items-end gap-2">
          {categoryState?.error && <Alert tone="error" className="w-full">{categoryState.error}</Alert>}
          <div className="flex-1">
            <Field label="Name" htmlFor="categoryName">
              <Input id="categoryName" name="name" required />
            </Field>
          </div>
          <SubmitButton>Add</SubmitButton>
        </form>

        {categories.length === 0 ? (
          <EmptyState title="No categories yet" />
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <span className="text-sm text-gray-700">{c.name}</span>
                <DeleteButton action={deleteBlogCategory} id={c.id} label={c.name} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Tags" description="Free-form labels for blog posts." />
        <form action={tagFormAction} className="mb-4 flex items-end gap-2">
          {tagState?.error && <Alert tone="error" className="w-full">{tagState.error}</Alert>}
          <div className="flex-1">
            <Field label="Name" htmlFor="tagName">
              <Input id="tagName" name="name" required />
            </Field>
          </div>
          <SubmitButton>Add</SubmitButton>
        </form>

        {tags.length === 0 ? (
          <EmptyState title="No tags yet" />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-full border border-gray-100 px-3 py-1">
                <Badge tone="gray">{t.name}</Badge>
                <DeleteButton action={deleteBlogTag} id={t.id} label={t.name} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
