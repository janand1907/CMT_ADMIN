"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateCategory } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save Changes
    </Button>
  );
}

export function EditCategoryForm({ category }) {
  const [state, formAction] = useFormState(updateCategory.bind(null, category.id), { error: null });

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <CardHeader title="Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={category.name} required />
          </Field>
          <Field label="Slug" htmlFor="slug" required hint="Used in the category's public URL.">
            <Input id="slug" name="slug" defaultValue={category.slug} required />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={category.status}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description" htmlFor="description">
            <Textarea id="description" name="description" defaultValue={category.description || ""} />
          </Field>
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
