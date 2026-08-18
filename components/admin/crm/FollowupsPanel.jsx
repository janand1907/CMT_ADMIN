"use client";

import { useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addFollowup, completeFollowup } from "@/app/admin/(protected)/crm/leads/[id]/actions";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { formatDate } from "@/lib/crm/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Schedule Follow-up
    </Button>
  );
}

function CompleteButton({ leadId, followupId }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      loading={pending}
      onClick={() => startTransition(() => completeFollowup(leadId, followupId))}
    >
      Mark complete
    </Button>
  );
}

export function FollowupsPanel({ leadId, followups, canManage }) {
  const [state, formAction] = useFormState(addFollowup.bind(null, leadId), { error: null });
  const pending = followups.filter((f) => !f.completed);
  const completed = followups.filter((f) => f.completed);

  return (
    <div className="space-y-4">
      {canManage && (
        <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          {state?.error && <Alert tone="error" className="sm:col-span-3">{state.error}</Alert>}
          <Field label="Scheduled for" htmlFor="scheduledAt">
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
          </Field>
          <Field label="Notes" htmlFor="followupNotes">
            <Input id="followupNotes" name="notes" />
          </Field>
          <SubmitButton />
        </form>
      )}

      {followups.length === 0 ? (
        <EmptyState title="No follow-ups scheduled" />
      ) : (
        <ul className="space-y-2">
          {[...pending, ...completed].map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{formatDate(f.scheduled_at)}</span>
                  {f.completed ? <Badge tone="green">Completed</Badge> : <Badge tone="amber">Pending</Badge>}
                </div>
                {f.notes && <p className="mt-0.5 text-xs text-gray-500">{f.notes}</p>}
              </div>
              {!f.completed && canManage && <CompleteButton leadId={leadId} followupId={f.id} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
