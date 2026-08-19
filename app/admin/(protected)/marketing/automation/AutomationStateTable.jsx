"use client";

import { useFormState, useFormStatus } from "react-dom";
import { setLeadAutomationStatus } from "./actions";
import { Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { AUTOMATION_STATE_NEXT_STATUSES, LEAD_AUTOMATION_STATUS_LABELS, LEAD_AUTOMATION_STATUS_TONES, STOP_REASON_LABELS } from "@/lib/whatsapp/constants";
import Link from "next/link";

function StateSelect({ stateId, currentStatus }) {
  const next = AUTOMATION_STATE_NEXT_STATUSES[currentStatus] || [];
  const [formState, formAction] = useFormState(setLeadAutomationStatus.bind(null, stateId), { error: null });

  if (next.length === 0) {
    return <span className="text-xs text-gray-400">Terminal</span>;
  }

  return (
    <form action={formAction}>
      <Select
        name="status"
        size="sm"
        className="w-32"
        defaultValue={currentStatus}
        onChange={(e) => {
          if (e.target.value !== currentStatus) {
            e.target.form.requestSubmit();
          }
        }}
      >
        <option value={currentStatus}>{LEAD_AUTOMATION_STATUS_LABELS[currentStatus]}</option>
        {next.map((s) => (
          <option key={s} value={s}>
            {LEAD_AUTOMATION_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      {formState?.error && <p className="mt-0.5 text-xs text-red-600" role="alert">{formState.error}</p>}
    </form>
  );
}

export default function AutomationStateTable({ states }) {
  if (!states || states.length === 0) {
    return <p className="text-sm text-gray-500">No leads are being tracked yet. Once automation is active, leads matching the criteria will appear here.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Enquiry #</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Customer</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Messages</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Last Sent</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Stop Reason</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Control</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {states.map((row) => {
            const customerName = row.customers?.name || row.leads?.customers?.name || "-";
            const enquiryNumber = row.leads?.enquiry_number || "-";
            const leadStatus = row.leads?.status || "";

            return (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/crm/leads/${row.lead_id}`} className="font-medium text-primary-700 hover:underline">
                    {enquiryNumber}
                  </Link>
                  {leadStatus && (
                    <span className="ml-1.5 text-xs text-gray-400">({leadStatus})</span>
                  )}
                </td>
                <td className="px-4 py-2.5">{customerName}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={LEAD_AUTOMATION_STATUS_TONES[row.status]}>{LEAD_AUTOMATION_STATUS_LABELS[row.status] || row.status}</Badge>
                </td>
                <td className="px-4 py-2.5 text-gray-600">{row.messages_sent} / {row.started_at ? "max" : "-"}</td>
                <td className="px-4 py-2.5 text-gray-500">
                  {row.last_sent_at ? (
                    <span>
                      {new Date(row.last_sent_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      {row.last_sent_slot && <span className="ml-1 text-xs text-gray-400">({row.last_sent_slot})</span>}
                    </span>
                  ) : (
                    "Never"
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-500">
                  {row.stop_reason ? STOP_REASON_LABELS[row.stop_reason] || row.stop_reason : "-"}
                </td>
                <td className="px-4 py-2.5">
                  <StateSelect stateId={row.id} currentStatus={row.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
