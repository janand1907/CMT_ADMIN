"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createPackage } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Package
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

export function NewPackageForm({ destinations, categories }) {
  const [state, formAction] = useFormState(createPackage, { error: null });
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <CardHeader title="Details" description="Content, pricing, images and SEO can be added once the package is created." />
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
          <Field label="Destination" htmlFor="destinationId">
            <Select id="destinationId" name="destinationId" defaultValue="">
              <option value="">None</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
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
          <Field label="Package Type" htmlFor="packageType" hint="e.g. darshan, vip, group, honeymoon">
            <Input id="packageType" name="packageType" />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue="inactive">
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </Select>
          </Field>
          <Field label="Duration (days)" htmlFor="durationDays">
            <Input id="durationDays" name="durationDays" type="number" min="0" />
          </Field>
          <Field label="Duration (nights)" htmlFor="durationNights">
            <Input id="durationNights" name="durationNights" type="number" min="0" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Short Description" htmlFor="shortDescription">
            <Textarea id="shortDescription" name="shortDescription" rows={2} />
          </Field>
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
