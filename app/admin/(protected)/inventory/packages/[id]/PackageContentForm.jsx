"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updatePackageContent } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Textarea, Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save Content
    </Button>
  );
}

export function PackageContentForm({ packageId, pkg }) {
  const [state, formAction] = useFormState(updatePackageContent.bind(null, packageId), { error: null });
  const [days, setDays] = useState(pkg.itinerary?.length ? pkg.itinerary : [{ day: 1, title: "", description: "" }]);

  function updateDay(idx, field, value) {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  }
  function addDay() {
    setDays((prev) => [...prev, { day: prev.length + 1, title: "", description: "" }]);
  }
  function removeDay(idx) {
    setDays((prev) => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <input type="hidden" name="itinerary" value={JSON.stringify(days)} />

      <Card>
        <CardHeader title="Description" />
        <Field label="Full Description" htmlFor="description">
          <Textarea id="description" name="description" rows={5} defaultValue={pkg.description || ""} />
        </Field>
      </Card>

      <Card>
        <CardHeader
          title="Itinerary"
          description="Day-by-day plan shown to customers."
          action={
            <Button type="button" variant="secondary" size="sm" onClick={addDay}>
              Add Day
            </Button>
          }
        />
        <div className="space-y-4">
          {days.map((day, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Day {day.day}</p>
                {days.length > 1 && (
                  <button type="button" onClick={() => removeDay(idx)} className="text-xs font-medium text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <Input placeholder="Title" value={day.title} onChange={(e) => updateDay(idx, "title", e.target.value)} />
                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={day.description}
                  onChange={(e) => updateDay(idx, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Inclusions & Exclusions" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Inclusions" htmlFor="inclusions" hint="One per line.">
            <Textarea id="inclusions" name="inclusions" rows={6} defaultValue={(pkg.inclusions || []).join("\n")} />
          </Field>
          <Field label="Exclusions" htmlFor="exclusions" hint="One per line.">
            <Textarea id="exclusions" name="exclusions" rows={6} defaultValue={(pkg.exclusions || []).join("\n")} />
          </Field>
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
