"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  updateQuotationStatus,
  createRevision,
  sendQuotationWhatsApp,
} from "@/app/admin/(protected)/crm/quotations/[id]/actions";
import { Select, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { QUOTATION_NEXT_STATUSES, QUOTATION_STATUS_LABELS, canRevise } from "@/lib/crm/quotationConstants";

function StatusSelect({ quotationId, status, disabled }) {
  const [state, formAction] = useFormState(updateQuotationStatus.bind(null, quotationId), { error: null });
  const nextStatuses = QUOTATION_NEXT_STATUSES[status] || [];

  return (
    <form action={formAction}>
      <Select
        name="status"
        defaultValue={status}
        disabled={disabled || nextStatuses.length === 0}
        onChange={(e) => e.target.form.requestSubmit()}
        className="w-44"
      >
        <option value={status}>{QUOTATION_STATUS_LABELS[status]}</option>
        {nextStatuses.map((s) => (
          <option key={s} value={s}>
            Mark as {QUOTATION_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      {state?.error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

function SendWhatsAppButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" loading={pending}>
      Send via WhatsApp
    </Button>
  );
}

function SendWhatsAppPanel({ quotationId }) {
  const [state, formAction] = useFormState(sendQuotationWhatsApp.bind(null, quotationId), { error: null });

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <SendWhatsAppButton />
      {state?.error && (
        <p className="text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.sent && !state?.error && <p className="text-xs text-green-600">Sent.</p>}
    </form>
  );
}

function ReviseButton({ quotationId }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" loading={pending}>
      Create Revision
    </Button>
  );
}

function RevisePanel({ quotationId }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createRevision.bind(null, quotationId), { error: null });

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-primary-700 hover:underline">
        Create a revision to edit this quotation further
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      {state?.error && <Alert tone="error" className="w-full">{state.error}</Alert>}
      <Textarea name="changeNote" placeholder="What's changing in this revision? (optional)" rows={2} className="w-72" />
      <ReviseButton quotationId={quotationId} />
    </form>
  );
}

// Revising archives the current sent/viewed/rejected/expired state into
// quotation_revisions and reopens this same row as a fresh draft version —
// the only way back to draft, per create_quotation_revision()'s own guard
// clauses (see the Phase 3 migration) — so it's offered here rather than as
// a plain status option.
export function QuotationStatusControl({ quotationId, status, canEdit, canSend }) {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
        <StatusSelect quotationId={quotationId} status={status} disabled={!canEdit} />
      </div>
      {canSend && status !== "accepted" && status !== "rejected" && status !== "expired" && (
        <div className="pt-5">
          <SendWhatsAppPanel quotationId={quotationId} />
        </div>
      )}
      {canEdit && canRevise(status) && (
        <div className="pt-5">
          <RevisePanel quotationId={quotationId} />
        </div>
      )}
    </div>
  );
}
