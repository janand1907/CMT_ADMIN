"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { addTask, updateTaskStatus } from "@/app/admin/(protected)/crm/leads/[id]/actions";
import { Field, Input, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import {
  TASK_TYPES,
  TASK_TYPE_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUS_TONES,
  PRIORITIES,
  PRIORITY_LABELS,
  formatDate,
} from "@/lib/crm/constants";

const PAGE_SIZE = 5;

const PRIORITY_DOTS = { low: "bg-gray-300", medium: "bg-amber-400", high: "bg-red-500" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Add Task
    </Button>
  );
}

function TaskStatusSelect({ leadId, taskId, status }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="w-28 shrink-0">
      <Select
        size="sm"
        defaultValue={status}
        disabled={pending}
        onChange={(e) => startTransition(() => updateTaskStatus(leadId, taskId, e.target.value))}
      >
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}

function TaskCard({ leadId, task, canManage }) {
  const overdue =
    task.due_at && task.status !== "done" && task.status !== "cancelled" && new Date(task.due_at) < new Date();

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOTS[task.priority] || PRIORITY_DOTS.medium}`}
            title={`${PRIORITY_LABELS[task.priority] || "Medium"} priority`}
          />
          <span className="truncate text-sm font-medium text-gray-800">{TASK_TYPE_LABELS[task.type]}</span>
          {!canManage && <Badge tone={TASK_STATUS_TONES[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>}
        </div>
        <p className={`mt-0.5 truncate text-xs ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}>
          {task.due_at ? `${overdue ? "Overdue" : "Due"} ${formatDate(task.due_at)}` : "No due date"}
          {task.assignee?.full_name ? ` · ${task.assignee.full_name}` : ""}
          {task.notes ? ` · ${task.notes}` : ""}
        </p>
      </div>
      {canManage && <TaskStatusSelect leadId={leadId} taskId={task.id} status={task.status} />}
    </li>
  );
}

export function TasksPanel({ leadId, tasks, staff, canManage }) {
  const [state, formAction] = useFormState(addTask.bind(null, leadId), { error: null });
  const router = useRouter();
  const isFirstRender = useRef(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // revalidatePath() in addTask doesn't reliably re-render this route on its
    // own here, leaving the new task inserted but invisible until a manual
    // refresh — force it after every successful submit.
    if (!state?.error) {
      router.refresh();
    }
  }, [state, router]);

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedTasks = useMemo(
    () => tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [tasks, page]
  );

  return (
    <div className="space-y-4">
      {canManage && (
        <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {state?.error && <Alert tone="error" className="lg:col-span-4">{state.error}</Alert>}
          <Field label="Type" htmlFor="taskType">
            <Select id="taskType" name="type" required>
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due" htmlFor="dueAt">
            <Input id="dueAt" name="dueAt" type="datetime-local" required />
          </Field>
          <Field label="Priority" htmlFor="taskPriority">
            <Select id="taskPriority" name="priority" defaultValue="medium">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assign To" htmlFor="taskAssignedTo">
            <Select id="taskAssignedTo" name="assignedTo" defaultValue="">
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
            </Select>
          </Field>
          <div className="lg:col-span-4">
            <SubmitButton />
          </div>
        </form>
      )}

      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" />
      ) : (
        <>
          <ul className="space-y-1.5">
            {pagedTasks.map((t) => (
              <TaskCard key={t.id} leadId={leadId} task={t} canManage={canManage} />
            ))}
          </ul>

          {tasks.length > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
