"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePage } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { CONTENT_STATUSES, CONTENT_STATUS_LABELS } from "@/lib/cms/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save
    </Button>
  );
}

export function PageDetailsForm({ page, canPublish }) {
  const action = updatePage.bind(null, page.id);
  const [state, formAction] = useFormState(action, { error: null });

  return (
    <Card>
      <CardHeader title="Details" />
      <form action={formAction} className="space-y-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        {state?.success && <Alert tone="success">Saved.</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={page.title} required />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            required
            hint={page.is_homepage ? 'The homepage\'s slug must stay "home".' : "Used in the page's public URL."}
          >
            <Input id="slug" name="slug" defaultValue={page.slug} required disabled={page.is_homepage} />
          </Field>
          <Field label="Status" htmlFor="status" hint={!canPublish ? "You can save as draft, but publishing needs the Publish Pages permission." : undefined}>
            <Select id="status" name="status" defaultValue={page.status}>
              {CONTENT_STATUSES.filter((s) => !(page.is_homepage && s === "archived")).map((s) => (
                <option key={s} value={s}>
                  {CONTENT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <SubmitButton />
      </form>
    </Card>
  );
}
