"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePackageDetails } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save Details
    </Button>
  );
}

function FormFeedback({ state }) {
  const { pending } = useFormStatus();
  if (pending) return null;
  if (state?.error) return <Alert tone="error">{state.error}</Alert>;
  if (state?.success) return <Alert tone="success">Package details saved.</Alert>;
  return null;
}

export function PackageDetailsForm({ pkg, destinations, categories }) {
  const [state, formAction] = useFormState(updatePackageDetails.bind(null, pkg.id), {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="space-y-6">
      <FormFeedback state={state} />

      <Card>
        <CardHeader title="Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={pkg.name} required />
          </Field>
          <Field label="Slug" htmlFor="slug" required>
            <Input id="slug" name="slug" defaultValue={pkg.slug} required />
          </Field>
          <Field label="Destination" htmlFor="destinationId">
            <Select id="destinationId" name="destinationId" defaultValue={pkg.destination_id || ""}>
              <option value="">None</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue={pkg.category_id || ""}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Package Type" htmlFor="packageType">
            <Input id="packageType" name="packageType" defaultValue={pkg.package_type || ""} />
          </Field>
          <Field label="Room / Category" htmlFor="roomCategory">
            <Input id="roomCategory" name="roomCategory" defaultValue={pkg.room_category || ""} />
          </Field>
          <Field label="Duration (days)" htmlFor="durationDays">
            <Input id="durationDays" name="durationDays" type="number" min="0" defaultValue={pkg.duration_days ?? ""} />
          </Field>
          <Field label="Duration (nights)" htmlFor="durationNights">
            <Input id="durationNights" name="durationNights" type="number" min="0" defaultValue={pkg.duration_nights ?? ""} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={pkg.status}>
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Short Description" htmlFor="shortDescription" hint="Shown in package listings.">
            <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={pkg.short_description || ""} />
          </Field>
        </div>
        <div className="mt-4 flex gap-6">
          <Checkbox name="featured" label="Featured package" defaultChecked={pkg.featured} />
          <Checkbox name="isAvailable" label="Available for booking" defaultChecked={pkg.is_available} />
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
