import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { CompleteFollowupButton } from "@/components/admin/crm/CompleteFollowupButton";
import { formatDate } from "@/lib/crm/constants";

const VIEWS = ["upcoming", "overdue", "completed"];

export default async function FollowupsInboxPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_followups"]);

  if (!perms.manage_followups) {
    return (
      <div>
        <PageHeader title="Follow-ups" />
        <ErrorState title="Access denied" description="You don't have permission to view follow-ups." />
      </div>
    );
  }

  const view = VIEWS.includes(searchParams?.view) ? searchParams.view : "upcoming";
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("lead_followups")
    .select("id, scheduled_at, notes, completed, completed_at, leads(id, enquiry_number, customers(name, phone))");

  if (view === "completed") {
    query = query.eq("completed", true).order("completed_at", { ascending: false });
  } else if (view === "overdue") {
    query = query.eq("completed", false).lt("scheduled_at", nowIso).order("scheduled_at", { ascending: true });
  } else {
    query = query.eq("completed", false).gte("scheduled_at", nowIso).order("scheduled_at", { ascending: true });
  }

  const { data: followups } = await query.limit(100);

  return (
    <div>
      <PageHeader title="Follow-ups" description="Scheduled contact reminders across every lead." />

      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {VIEWS.map((v) => (
          <Link
            key={v}
            href={`/admin/crm/followups?view=${v}`}
            className={`border-b-2 px-3 py-2 text-sm font-medium capitalize transition ${
              view === v ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {v}
          </Link>
        ))}
      </div>

      <Table>
        <THead>
          <Th>Scheduled</Th>
          <Th>Lead</Th>
          <Th>Notes</Th>
          <Th></Th>
        </THead>
        <TBody>
          {(!followups || followups.length === 0) && <EmptyRow colSpan={4}>Nothing here.</EmptyRow>}
          {followups?.map((f) => (
            <Tr key={f.id}>
              <Td>
                {formatDate(f.scheduled_at)}
                {view === "overdue" && (
                  <div>
                    <Badge tone="red">Overdue</Badge>
                  </div>
                )}
              </Td>
              <Td>
                {f.leads && (
                  <Link href={`/admin/crm/leads/${f.leads.id}`} className="font-medium text-primary-700 hover:underline">
                    {f.leads.enquiry_number}
                  </Link>
                )}
                <div className="text-xs text-gray-400">{f.leads?.customers?.name}</div>
              </Td>
              <Td>{f.notes || "-"}</Td>
              <Td>{!f.completed && <CompleteFollowupButton followupId={f.id} />}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
