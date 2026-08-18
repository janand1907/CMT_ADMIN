"use client";

import { useTransition } from "react";
import { updateTaskStatusFromInbox } from "@/app/admin/(protected)/crm/tasks/actions";
import { Select } from "@/components/admin/ui/FormControls";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/crm/constants";

export function TaskStatusInboxSelect({ taskId, status }) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      className="w-36"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateTaskStatusFromInbox(taskId, e.target.value))}
    >
      {TASK_STATUSES.map((s) => (
        <option key={s} value={s}>
          {TASK_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
