import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { TaskStatusInboxSelect } from "@/components/admin/crm/TaskStatusInboxSelect";
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_TONES, formatDate } from "@/lib/crm/constants";

export default async function TasksInboxPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_tasks"]);

  if (!perms.manage_tasks) {
    return (
      <div>
        <PageHeader title="Tasks" />
        <ErrorState title="Access denied" description="You don't have permission to view tasks." />
      </div>
    );
  }

  const status = TASK_STATUSES.includes(searchParams?.status) ? searchParams.status : "";

  let query = supabase
    .from("lead_tasks")
    .select("id, type, due_at, priority, status, notes, leads(id, enquiry_number), assignee:users!lead_tasks_assigned_to_fkey(full_name)")
    .order("due_at", { ascending: true, nullsFirst: false });

  if (status) query = query.eq("status", status);
  else query = query.neq("status", "cancelled");

  const { data: tasks } = await query.limit(100);

  return (
    <div>
      <PageHeader title="Tasks" description="Every task across all leads." />

      <form method="get" className="mb-4 flex items-end gap-3">
        <div className="w-48">
          <Select name="status" defaultValue={status}>
            <option value="">Open (not cancelled)</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary" size="md">
          Filter
        </Button>
      </form>

      <Table>
        <THead>
          <Th>Type</Th>
          <Th>Lead</Th>
          <Th>Due</Th>
          <Th>Priority</Th>
          <Th>Assigned To</Th>
          <Th>Status</Th>
        </THead>
        <TBody>
          {(!tasks || tasks.length === 0) && <EmptyRow colSpan={6}>Nothing here.</EmptyRow>}
          {tasks?.map((t) => (
            <Tr key={t.id}>
              <Td>{TASK_TYPE_LABELS[t.type]}</Td>
              <Td>
                {t.leads && (
                  <Link href={`/admin/crm/leads/${t.leads.id}`} className="font-medium text-primary-700 hover:underline">
                    {t.leads.enquiry_number}
                  </Link>
                )}
              </Td>
              <Td>{formatDate(t.due_at)}</Td>
              <Td>
                <Badge tone={PRIORITY_TONES[t.priority]}>{PRIORITY_LABELS[t.priority]}</Badge>
              </Td>
              <Td>{t.assignee?.full_name || "-"}</Td>
              <Td>
                <TaskStatusInboxSelect taskId={t.id} status={t.status} />
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
