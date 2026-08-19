"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateAutomationRules, setLeadAutomationStatus } from "./actions";
import { Field, Select, Checkbox } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/crm/constants";
import { AUTOMATION_ENGINE_STATUS_LABELS } from "@/lib/whatsapp/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Save Settings
    </Button>
  );
}

function StateSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="secondary" loading={pending}>
      Apply
    </Button>
  );
}

export default function AutomationRuleForm({ rule }) {
  const [state, formAction] = useFormState(updateAutomationRules.bind(null, rule?.id), {
    error: null,
    success: false,
  });

  if (!rule) {
    return <p className="text-sm text-gray-500">No automation rule found.</p>;
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">Settings saved.</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Status" htmlFor="status">
          <Select name="status" id="status" defaultValue={rule.status}>
            {Object.entries(AUTOMATION_ENGINE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Follow-up Duration (days)" htmlFor="followupDurationDays" required>
          <input
            id="followupDurationDays"
            name="followupDurationDays"
            type="number"
            min="1"
            defaultValue={rule.followup_duration_days}
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Morning Time" htmlFor="morningTime">
          <input
            id="morningTime"
            name="morningTime"
            type="time"
            defaultValue={rule.morning_time}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </Field>
        <Field label="Evening Time" htmlFor="eveningTime">
          <input
            id="eveningTime"
            name="eveningTime"
            type="time"
            defaultValue={rule.evening_time}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </Field>
      </div>

      <Field label="Max Messages per Lead" htmlFor="maxMessages" required>
        <input
          id="maxMessages"
          name="maxMessages"
          type="number"
          min="1"
          defaultValue={rule.max_messages}
          required
          className="block w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </Field>

      <Field label="Eligible Lead Statuses">
        <div className="mt-1 flex flex-wrap gap-3">
          {LEAD_STATUSES.map((s) => (
            <Checkbox
              key={s}
              label={LEAD_STATUS_LABELS[s]}
              name={`eligible_${s}`}
              defaultChecked={(rule.eligible_lead_statuses || []).includes(s)}
            />
          ))}
        </div>
      </Field>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
