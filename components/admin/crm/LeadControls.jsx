"use client";

import { useFormState } from "react-dom";
import { updateLeadStatus, updateLeadPriority, assignLead } from "@/app/admin/(protected)/crm/leads/[id]/actions";
import { Select } from "@/components/admin/ui/FormControls";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, PRIORITIES, PRIORITY_LABELS } from "@/lib/crm/constants";

function AutoSubmitForm({ action, name, defaultValue, options, disabled }) {
  const [state, formAction] = useFormState(action, { error: null });

  return (
    <form action={formAction}>
      <Select
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(e) => e.target.form.requestSubmit()}
        className="w-44"
      >
        {options}
      </Select>
      {state?.error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function LeadControls({ leadId, status, priority, assignedTo, staff, canEdit, canAssign, currentUserId }) {
  // enforce_lead_reassignment_trg (see the Phase 1 migration) lets anyone with
  // edit_leads take an unassigned lead or drop their own — but never hand it
  // to someone else — so mirror that exact carve-out in what the UI offers,
  // instead of just disabling the control for everyone without assign_leads.
  const canSelfServe = !canAssign && canEdit && (!assignedTo || assignedTo === currentUserId);
  const assignEnabled = canAssign || canSelfServe;
  const me = staff.find((s) => s.id === currentUserId);

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
        <AutoSubmitForm
          action={updateLeadStatus.bind(null, leadId)}
          name="status"
          defaultValue={status}
          disabled={!canEdit}
          options={LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Priority</label>
        <AutoSubmitForm
          action={updateLeadPriority.bind(null, leadId)}
          name="priority"
          defaultValue={priority}
          disabled={!canEdit}
          options={PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Assigned To</label>
        <AutoSubmitForm
          action={assignLead.bind(null, leadId)}
          name="assignedTo"
          defaultValue={assignedTo || ""}
          disabled={!assignEnabled}
          options={
            canAssign ? (
              <>
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.email}
                  </option>
                ))}
              </>
            ) : (
              <>
                <option value="">Unassigned</option>
                {me && <option value={me.id}>{me.full_name || me.email} (me)</option>}
              </>
            )
          }
        />
      </div>
    </div>
  );
}
