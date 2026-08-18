"use client";

import { useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createTag, deleteTag, createSource, deleteSource } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";

const TAG_COLORS = ["gray", "blue", "indigo", "purple", "amber", "green", "red", "primary"];

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

export function TagsAndSourcesManager({ tags, sources }) {
  const [tagState, tagFormAction] = useFormState(createTag, { error: null });
  const [sourceState, sourceFormAction] = useFormState(createSource, { error: null });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Tags" description="Free-form labels staff can attach to leads." />

        <form action={tagFormAction} className="mb-4 flex items-end gap-2">
          {tagState?.error && <Alert tone="error" className="w-full">{tagState.error}</Alert>}
          <div className="flex-1">
            <Field label="Name" htmlFor="tagName">
              <Input id="tagName" name="name" required />
            </Field>
          </div>
          <div className="w-32">
            <Field label="Color" htmlFor="tagColor">
              <Select id="tagColor" name="color" defaultValue="gray">
                {TAG_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <SubmitButton>Add</SubmitButton>
        </form>

        {tags.length === 0 ? (
          <EmptyState title="No tags yet" />
        ) : (
          <ul className="space-y-2">
            {tags.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <Badge tone={t.color}>{t.name}</Badge>
                <DeleteButton action={deleteTag} id={t.id} label={t.name} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Sources" description="Marketing/referral channels a lead can come from." />

        <form action={sourceFormAction} className="mb-4 flex items-end gap-2">
          {sourceState?.error && <Alert tone="error" className="w-full">{sourceState.error}</Alert>}
          <div className="flex-1">
            <Field label="Name" htmlFor="sourceName">
              <Input id="sourceName" name="name" required />
            </Field>
          </div>
          <SubmitButton>Add</SubmitButton>
        </form>

        {sources.length === 0 ? (
          <EmptyState title="No sources yet" />
        ) : (
          <ul className="space-y-2">
            {sources.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <span className="text-sm text-gray-700">{s.name}</span>
                <DeleteButton action={deleteSource} id={s.id} label={s.name} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
