"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addMessage } from "@/app/admin/(protected)/crm/quotations/[id]/actions";
import { Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { Timeline, TimelineItem } from "@/components/admin/ui/Timeline";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { QUOTATION_MESSAGE_CHANNEL_LABELS, formatDate } from "@/lib/crm/quotationConstants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Add Note
    </Button>
  );
}

// One combined append-only log for status changes, share-link opens, and
// manual staff notes (quotation_messages) — mirrors lead_activities/
// lead_notes being distinct in Phase 1, except here everything except
// manual notes is DB-trigger-generated, so this panel is read-mostly.
export function QuotationMessagesPanel({ quotationId, messages, canEdit }) {
  const [state, formAction] = useFormState(addMessage.bind(null, quotationId), { error: null });

  return (
    <div className="space-y-4">
      {canEdit && (
        <form action={formAction} className="space-y-2">
          {state?.error && <Alert tone="error">{state.error}</Alert>}
          <Textarea name="message" placeholder="Add a note about this quotation..." required />
          <SubmitButton />
        </form>
      )}

      {messages.length === 0 ? (
        <EmptyState title="No messages yet" />
      ) : (
        <Timeline>
          {messages.map((m) => (
            <TimelineItem
              key={m.id}
              title={m.message}
              meta={`${QUOTATION_MESSAGE_CHANNEL_LABELS[m.channel] || m.channel} · ${formatDate(m.created_at)}`}
            >
              {m.created_by_user?.full_name || "System"}
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
}
